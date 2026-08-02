<#
  おとも（画面端のドット絵キャラ）のフレーム画像を作り直すツール。

    Talk-AI-images/*.png  （元絵・1枚ずつ書き出したもの）
      -> Talk-AI-images/web/*.png / *.webp （サイトが読む配信用）

  元絵は書き出しのたびにキャラの大きさと位置がずれるため、そのまま切り替えると
  画面上で跳ねます。このツールは idel を基準に拡大率と位置をそろえます。

    1. 背景（不透明な黒）を画面のふちから塗りつぶし式にたどって透過にする
    2. 書き出しゴミ（数十ピクセルの浮きカス）を消す
    3. 下半身を手がかりに相互相関で (拡大率, 横ズレ, 縦ズレ) を求めて idel に合わせる
    4. 5枚の共通範囲で切り抜いて縮小し、ロスレス webp に変換

  実行：
      powershell -ExecutionPolicy Bypass -File tools/build-mascot.ps1

  必要なもの：Windows（System.Drawing）と cwebp。
  cwebp が無い場合は .png だけ作られるので、別の手段で webp にしてください。

  出力の最後に表示される「aspect-ratio」を assets/css/style.css の
  .mascot__btn に反映すること。
#>

[CmdletBinding()]
param(
  [string]$Root,
  [string]$Reference = 'idel',
  [int]   $OutHeight = 420
)

# param のなかでは $PSScriptRoot が空になることがあるので、ここで解決する
if (-not $Root) {
  $here = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
  $Root = Split-Path -Parent $here
}

Add-Type -AssemblyName System.Drawing

$src = Join-Path $Root 'Talk-AI-images'
$dst = Join-Path $src  'web'
$names = @('idel','yure1','yure2','mabataki1','mabataki2')

if (-not (Test-Path $src)) { throw "元絵のフォルダが見つかりません: $src" }
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst | Out-Null }
foreach ($n in $names) {
  if (-not (Test-Path (Join-Path $src "$n.png"))) { throw "元絵がありません: $n.png" }
}

# ---------------------------------------------------------------- C# ヘルパ
$cs = @'
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class MascotImg {
  public int W, H;
  public byte[] Px;   // BGRA

  public static MascotImg Load(string path) {
    MascotImg f = new MascotImg();
    using (Bitmap bmp = new Bitmap(path)) {
      int w = bmp.Width, h = bmp.Height;
      f.W = w; f.H = h;
      BitmapData d = bmp.LockBits(new Rectangle(0,0,w,h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      byte[] tmp = new byte[d.Stride * h];
      Marshal.Copy(d.Scan0, tmp, 0, tmp.Length);
      bmp.UnlockBits(d);
      f.Px = new byte[w * h * 4];
      for (int y = 0; y < h; y++) Array.Copy(tmp, y * d.Stride, f.Px, y * w * 4, w * 4);
    }
    return f;
  }

  public int Lum(int p) { int i = p*4; return (54 * Px[i+2] + 183 * Px[i+1] + 19 * Px[i]) >> 8; }

  public byte[] Gray() {
    byte[] g = new byte[W * H];
    for (int p = 0; p < W * H; p++) g[p] = (byte)Lum(p);
    return g;
  }

  // 画面のふちから黒をたどって透過にする（キャラの黒い衣装は明るい縁取りに守られて残る）
  public void KeyOutBackground(int cut, int featherTop) {
    int w = W, h = H;
    bool[] bg = new bool[w * h];
    Stack<int> st = new Stack<int>();
    for (int x = 0; x < w; x++) { st.Push(x); st.Push((h-1)*w + x); }
    for (int y = 0; y < h; y++) { st.Push(y*w); st.Push(y*w + w - 1); }
    while (st.Count > 0) {
      int p = st.Pop();
      if (bg[p]) continue;
      if (Lum(p) > cut) continue;
      bg[p] = true;
      int px = p % w, py = p / w;
      if (px > 0)     st.Push(p - 1);
      if (px < w - 1) st.Push(p + 1);
      if (py > 0)     st.Push(p - w);
      if (py < h - 1) st.Push(p + w);
    }
    byte[] alpha = new byte[w * h];
    for (int p = 0; p < w * h; p++) alpha[p] = bg[p] ? (byte)0 : (byte)255;
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        int p = y*w + x;
        if (bg[p]) continue;
        bool edge = (x > 0 && bg[p-1]) || (x < w-1 && bg[p+1]) ||
                    (y > 0 && bg[p-w]) || (y < h-1 && bg[p+w]);
        if (!edge) continue;
        int l = Lum(p);
        if (l < featherTop) alpha[p] = (byte)(255 * l / featherTop);
      }
    }
    for (int p = 0; p < w * h; p++) Px[p*4 + 3] = alpha[p];
  }

  // 書き出しゴミ（小さすぎる島）を消す
  public int Despeckle(int minArea) {
    int w = W, h = H;
    int[] lab = new int[w * h];
    for (int i = 0; i < lab.Length; i++) lab[i] = -1;
    List<int> areas = new List<int>();
    Stack<int> st = new Stack<int>();
    for (int p0 = 0; p0 < w * h; p0++) {
      if (lab[p0] != -1) continue;
      if (Px[p0*4 + 3] <= 32) { lab[p0] = -2; continue; }
      int id = areas.Count, area = 0;
      st.Push(p0); lab[p0] = id;
      while (st.Count > 0) {
        int p = st.Pop(); area++;
        int x = p % w, y = p / w;
        if (x > 0     && lab[p-1] == -1 && Px[(p-1)*4+3] > 32) { lab[p-1] = id; st.Push(p-1); }
        if (x < w - 1 && lab[p+1] == -1 && Px[(p+1)*4+3] > 32) { lab[p+1] = id; st.Push(p+1); }
        if (y > 0     && lab[p-w] == -1 && Px[(p-w)*4+3] > 32) { lab[p-w] = id; st.Push(p-w); }
        if (y < h - 1 && lab[p+w] == -1 && Px[(p+w)*4+3] > 32) { lab[p+w] = id; st.Push(p+w); }
      }
      areas.Add(area);
    }
    int removed = 0;
    for (int p = 0; p < w * h; p++) {
      int id = lab[p];
      if (id >= 0 && areas[id] < minArea) { Px[p*4 + 3] = 0; removed++; }
    }
    return removed;
  }

  public void AlphaBBox(out int minX, out int minY, out int maxX, out int maxY) {
    minX = W; minY = H; maxX = -1; maxY = -1;
    for (int y = 0; y < H; y++)
      for (int x = 0; x < W; x++) {
        if (Px[(y*W + x)*4 + 3] <= 32) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  }

  public Bitmap ToBitmap() {
    Bitmap bmp = new Bitmap(W, H, PixelFormat.Format32bppArgb);
    BitmapData d = bmp.LockBits(new Rectangle(0,0,W,H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
    for (int y = 0; y < H; y++)
      Marshal.Copy(Px, y * W * 4, (IntPtr)(d.Scan0.ToInt64() + y * d.Stride), W * 4);
    bmp.UnlockBits(d);
    return bmp;
  }
}

public class MascotFit {
  public static byte[] Down(byte[] s, int w, int h, out int nw, out int nh) {
    nw = w / 2; nh = h / 2;
    byte[] d = new byte[nw * nh];
    for (int y = 0; y < nh; y++)
      for (int x = 0; x < nw; x++)
        d[y*nw + x] = (byte)((s[(y*2)*w + x*2] + s[(y*2)*w + x*2+1] +
                              s[(y*2+1)*w + x*2] + s[(y*2+1)*w + x*2+1]) >> 2);
    return d;
  }

  static double Sample(byte[] mv, int w, int h, double fx, double fy) {
    if (fx < 0) fx = 0; if (fy < 0) fy = 0;
    if (fx > w - 1.001) fx = w - 1.001;
    if (fy > h - 1.001) fy = h - 1.001;
    int x0 = (int)fx, y0 = (int)fy;
    double tx = fx - x0, ty = fy - y0;
    int i00 = y0*w + x0;
    double a = mv[i00]     + (mv[i00+1]     - mv[i00])     * tx;
    double b = mv[i00 + w] + (mv[i00+w+1]   - mv[i00 + w]) * tx;
    return a + (b - a) * ty;
  }

  public static double Res(byte[] rf, byte[] mv, int w, int h,
                           int x0, int y0, int x1, int y1,
                           double cx, double cy, double s, double dx, double dy, int step) {
    double sum = 0; int n = 0;
    for (int y = y0; y < y1; y += step) {
      double fy = cy + (y - cy) * s + dy;
      if (fy < 0 || fy > h - 1) return double.MaxValue;
      for (int x = x0; x < x1; x += step) {
        double fx = cx + (x - cx) * s + dx;
        if (fx < 0 || fx > w - 1) return double.MaxValue;
        double d = rf[y*w + x] - Sample(mv, w, h, fx, fy);
        sum += (d < 0 ? -d : d);
        n++;
      }
    }
    return n == 0 ? double.MaxValue : sum / n;
  }

  public static double[] Search(byte[] rf, byte[] mv, int w, int h,
                                int x0, int y0, int x1, int y1, double cx, double cy,
                                double sLo, double sHi, double sStep,
                                double tLoX, double tHiX, double tLoY, double tHiY,
                                double tStep, int px) {
    double bs = 1, bdx = 0, bdy = 0, best = double.MaxValue;
    for (double s = sLo; s <= sHi + 1e-9; s += sStep)
      for (double dy = tLoY; dy <= tHiY + 1e-9; dy += tStep)
        for (double dx = tLoX; dx <= tHiX + 1e-9; dx += tStep) {
          double r = Res(rf, mv, w, h, x0, y0, x1, y1, cx, cy, s, dx, dy, px);
          if (r < best) { best = r; bs = s; bdx = dx; bdy = dy; }
        }
    return new double[] { bs, bdx, bdy, best };
  }
}
'@
Add-Type -TypeDefinition $cs -ReferencedAssemblies System.Drawing

# ---------------------------------------------------------------- 1. 透過 + ゴミ取り
Write-Host "[1/4] 背景を透過にして、書き出しゴミを消しています..."
$imgs = @{}
foreach ($n in $names) {
  $f = [MascotImg]::Load((Join-Path $src "$n.png"))
  $f.KeyOutBackground(48, 110)
  $gone = $f.Despeckle(600)
  $imgs[$n] = $f
  Write-Host ("      {0,-11} {1}x{2}  ゴミ {3} px" -f $n, $f.W, $f.H, $gone)
}

$ref = $imgs[$Reference]
$W = $ref.W; $H = $ref.H
foreach ($n in $names) {
  if ($imgs[$n].W -ne $W -or $imgs[$n].H -ne $H) {
    throw "元絵のキャンバスサイズが揃っていません: $n は $($imgs[$n].W)x$($imgs[$n].H)、$Reference は ${W}x${H}"
  }
}

# 基準フレームのシルエットから、合わせ込みに使う範囲を決める
$mnx=0;$mny=0;$mxx=0;$mxy=0
$ref.AlphaBBox([ref]$mnx,[ref]$mny,[ref]$mxx,[ref]$mxy)
# 横は左72%だけ使う（揺れフレームで右へ流れる髪を避けるため）
$rx0 = [int]($mnx/4); $rx1 = [int](($mnx + ($mxx-$mnx)*0.72)/4)
$ry0 = [int]($mny/4); $ry1 = [int]($mxy/4)
$cx4 = ($rx0 + $rx1)/2.0; $cy4 = ($ry0 + $ry1)/2.0

# ---------------------------------------------------------------- 2. 拡大率と位置を合わせる
Write-Host "[2/4] $Reference に合わせて拡大率と位置を探索しています..."
$w2=0;$h2=0;$w4=0;$h4=0
$rg = $ref.Gray()
$r4 = [MascotFit]::Down(([MascotFit]::Down($rg, $W, $H, [ref]$w2, [ref]$h2)), $w2, $h2, [ref]$w4, [ref]$h4)

$fit = @{}
foreach ($n in $names) {
  if ($n -eq $Reference) { $fit[$n] = @(1.0, 0.0, 0.0); continue }
  $mg = $imgs[$n].Gray()
  $m4 = [MascotFit]::Down(([MascotFit]::Down($mg, $W, $H, [ref]$w2, [ref]$h2)), $w2, $h2, [ref]$w4, [ref]$h4)
  $c = [MascotFit]::Search($r4, $m4, $w4, $h4, $rx0, $ry0, $rx1, $ry1, $cx4, $cy4,
                           0.88, 1.12, 0.01, -30, 30, -30, 30, 2, 2)
  $f = [MascotFit]::Search($r4, $m4, $w4, $h4, $rx0, $ry0, $rx1, $ry1, $cx4, $cy4,
                           ($c[0]-0.02), ($c[0]+0.02), 0.002,
                           ($c[1]-3), ($c[1]+3), ($c[2]-3), ($c[2]+3), 0.5, 1)
  $fit[$n] = @($f[0], $f[1], $f[2])
  Write-Host ("      {0,-11} 拡大率={1,7:N4}  横={2,7:N2}  縦={3,7:N2}  （残差 {4:N2}）" -f $n, $f[0], $f[1], $f[2], $f[3])
}

# ---------------------------------------------------------------- 3. 共通のキャンバスに描き直す
Write-Host "[3/4] そろえた状態で描き直しています..."
$cx = $cx4 * 4; $cy = $cy4 * 4
$PAD = 260
$canvasW = $W + $PAD*2; $canvasH = $H + $PAD*2
$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("mascot-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmpDir | Out-Null

$uMinX = [int]::MaxValue; $uMinY = [int]::MaxValue; $uMaxX = -1; $uMaxY = -1
foreach ($n in $names) {
  $f = $imgs[$n]
  $srcBmp = $f.ToBitmap()
  $pm = $srcBmp.Clone((New-Object System.Drawing.Rectangle(0,0,$W,$H)),
                      [System.Drawing.Imaging.PixelFormat]::Format32bppPArgb)
  $srcBmp.Dispose()

  $p = $fit[$n]
  $s = [double]$p[0]; $dx = [double]$p[1] * 4; $dy = [double]$p[2] * 4

  $canvas = New-Object System.Drawing.Bitmap($canvasW, $canvasH, [System.Drawing.Imaging.PixelFormat]::Format32bppPArgb)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.DrawImage($pm, (New-Object System.Drawing.RectangleF(
      [single]($cx + (0 - $cx - $dx)/$s + $PAD),
      [single]($cy + (0 - $cy - $dy)/$s + $PAD),
      [single]($W/$s), [single]($H/$s))))
  $g.Dispose(); $pm.Dispose()

  $out = $canvas.Clone((New-Object System.Drawing.Rectangle(0,0,$canvasW,$canvasH)),
                       [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $canvas.Dispose()
  $path = Join-Path $tmpDir "$n.png"
  $out.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $out.Dispose()

  $a = [MascotImg]::Load($path)
  $x0=0;$y0=0;$x1=0;$y1=0
  $a.AlphaBBox([ref]$x0,[ref]$y0,[ref]$x1,[ref]$y1)
  if ($x0 -lt $uMinX) { $uMinX = $x0 }
  if ($y0 -lt $uMinY) { $uMinY = $y0 }
  if ($x1 -gt $uMaxX) { $uMaxX = $x1 }
  if ($y1 -gt $uMaxY) { $uMaxY = $y1 }
}

# ---------------------------------------------------------------- 4. 切り抜き・縮小・webp
Write-Host "[4/4] 切り抜いて縮小し、webp にしています..."
$mSide = 26; $mTop = 26; $mBottom = 8    # 足元はほぼ余白なしで、画面の下辺に立たせる
$cropX = $uMinX - $mSide
$cropY = $uMinY - $mTop
$cropW = ($uMaxX - $uMinX + 1) + $mSide*2
$cropH = ($uMaxY - $uMinY + 1) + $mTop + $mBottom
$outW = [int][math]::Round($cropW * $OutHeight / $cropH)

$hasCwebp = [bool](Get-Command cwebp -ErrorAction SilentlyContinue)
foreach ($n in $names) {
  $b = New-Object System.Drawing.Bitmap((Join-Path $tmpDir "$n.png"))
  $pm = $b.Clone((New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)),
                 [System.Drawing.Imaging.PixelFormat]::Format32bppPArgb)
  $b.Dispose()
  $small = New-Object System.Drawing.Bitmap($outW, $OutHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppPArgb)
  $g = [System.Drawing.Graphics]::FromImage($small)
  $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.CompositingMode    = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $g.DrawImage($pm, (New-Object System.Drawing.Rectangle(0,0,$outW,$OutHeight)))
  $g.Dispose(); $pm.Dispose()
  $fin = $small.Clone((New-Object System.Drawing.Rectangle(0,0,$outW,$OutHeight)),
                      [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $small.Dispose()
  $fin.Save((Join-Path $dst "$n.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $fin.Dispose()
  if ($hasCwebp) {
    & cwebp -quiet -lossless -z 9 -alpha_filter best (Join-Path $dst "$n.png") -o (Join-Path $dst "$n.webp")
  }
}
Remove-Item -Recurse -Force $tmpDir

Write-Host ""
Get-ChildItem "$dst\*" | Sort-Object Name | ForEach-Object {
  Write-Host ("      {0,-26} {1,6} KB" -f $_.Name, [math]::Round($_.Length/1KB))
}
if (-not $hasCwebp) {
  Write-Warning "cwebp が見つからないため .webp を作れませんでした。サイトは .webp を読むので、別途変換してください。"
}
Write-Host ""
Write-Host "できあがり: ${outW} x ${OutHeight}"
Write-Host "assets/css/style.css の .mascot__btn を次の値にしてください:"
Write-Host "      aspect-ratio: ${outW} / ${OutHeight};"
