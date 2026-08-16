/* =========================================================
   ポートフォリオ コンテンツデータ
   本文は「ポートフォリオ原稿.md」から使用しています。
   ブロック種別:
     p / h / ul / table / note / quote / img / gallery / video / links / kv
   ========================================================= */

const DATA = {

  /* ---------------- 基本情報 ---------------- */
  profile: {
    name: '小松 主弥',
    kana: 'コマツ カズヤ',
    school: '大正大学 臨床心理学部 臨床心理学科 3年（21歳）',
    graduate: '2028年3月 卒業見込み（28卒）',
    mail: 'kmt.ps037@gmail.com',
    github: 'https://github.com/kmtkzy1379',
    lead: '2年ほどの個人開発。企画から実装、公開までを一通り自分で通してきました。',
    job: 'AIプロダクトの企画・PdM を志望',
    skills: [
      '自走力と知識欲',
      'AIの仕組みの理解',
      'エンジニアの実務経験',
      '心理学の知識'
    ]
  },

  /* ---------------- 自己紹介ページの閲覧項目（3） ---------------- */
  introItems: [
    {
      id: 'summary',
      label: 'じっせき サマリー',
      title: '実績サマリー',
      blocks: [
        { type: 'ul', items: [
          '<strong>2年ほどの個人開発。</strong> 企画から実装、公開までを一通り自分で通してきました',
          '<strong>インターンでの実務経験。</strong> チーム開発の進め方と、企業の中でのエンジニア業務を理解しています',
          '<strong>オンボーディングの企画・構築。</strong> 研修制度・勉強会・マニュアル作成を企画し、インターン生を巻き込んで企画書を作成。CEOに打診し、業務時間内で実施する許可を得ました'
        ]}
      ]
    },
    {
      id: 'selfpr',
      label: 'とくぎ（自己PR）',
      title: '自己PR',
      blocks: [
        { type: 'h', text: '自走力と知識欲' },
        { type: 'p', text: '完全独学で始め、2年間の個人開発を継続。加えて3ヶ月のインターンに参加しています。' },
        { type: 'h', text: 'AIの仕組みの理解' },
        { type: 'p', text: 'AI開発を通じて、出力が統計的・確率的・数理的に決まることを理解しています。だからこそ、<strong>どうすれば精度が高く、ハルシネーションの少ない出力が得られるかを、勘ではなく仕組みから説明できます。</strong>' },
        { type: 'h', text: 'エンジニアの実務経験' },
        { type: 'p', text: 'チーム開発と、企業としてのコーディングを体感し、現場を理解しています。' },
        { type: 'h', text: '心理学の知識' },
        { type: 'p', text: 'コミュニケーションの場面で、相手がなぜその行動を取ったのか、何が本当の課題かを分析して提案できます。インターン生のオンボーディングも、機械学習環境のオンボーディングも、この分析から提案し、先導しました。' }
      ]
    },
    {
      id: 'will',
      label: 'こころざし',
      title: 'なぜAIプロダクトの企画・PdMを志すか',
      blocks: [
        { type: 'h', text: '企画力を最も発揮できる仕事だから' },
        { type: 'p', text: '個人開発とインターンで培った企画力・アイデア力が、最も活きる職種だと感じています。' },
        { type: 'h', text: 'ゼロイチを作って回すのが好きだから' },
        { type: 'p', text: '現状の問題を分析し、新しい何かを作り出す過程そのものが好きです。' },
        { type: 'h', text: '上流と下流の両方を経験しているから' },
        { type: 'p', text: '企画やオンボーディングという上流と、コーディング・デプロイという下流の、両方を経験しています。<strong>下流を理解している人間が上流をやれば、「技術的に何ができるか」「実装がどれくらい難しいか」を体感として持っているぶん、認識のズレが少なくなります。</strong>' },
        { type: 'h', text: '上流に魅力を感じたから' },
        { type: 'p', text: '日々AIは進化しておりコーディングする時間は減りつつあります。そして今のエンジニアに求められるのはAIが生成したコードを読み込み理解し責任を持つことです。それよりもゼロイチを作って回すのが好きだからこそ新しい実装方法や企画に専念できる上流に強い魅力を感じて目指そうと思いました。' }
      ]
    }
  ],

  /* ---------------- 作品（7） ---------------- */
  works: [
    {
      id: 'promptgolf',
      pickup: true,
      title: 'PromptGolf',
      sub: 'AIに指示して迷路をクリアしながら、AIについて学べるゲーム',
      tags: ['Unity', 'ローカルLLM', 'RAG', 'ゲーム'],
      status: '公開中（β版・無料・Windows）',
      cover: 'images/promptgolf/cover.png',
      blocks: [
        { type: 'h', text: '概要' },
        { type: 'p', text: 'PC内のAI（ローカルLLM）に指示を出して、迷路をクリアするゲームです。<strong>より適切で、より少ない指示でクリアするほど高得点。</strong> ほかに、AI活用をクイズ形式で学べるモードや、AIとチャットで質問できる機能があります。' },
        { type: 'video', src: 'images/promptgolf/intro.mp4', poster: 'images/promptgolf/cover.png', caption: '紹介動画' },
        { type: 'h', text: 'なぜ作ったか' },
        { type: 'p', text: 'いまやほとんどの作業や業務でAIは必須です。しかし「コンテキスト」「トークン」と用語が多すぎて、学ぶ気が起きない人も少なくありません。AIを使うこと自体に抵抗がある人、うまく使いこなせていない人もいます。<strong>そういう人たちに、楽しみながらAIを使いこなしてほしい</strong>と考えました。' },
        { type: 'p', text: 'だからこそ、Skills や .md といった踏み込んだ話はあえて説明していません。<strong>最低限のセキュリティリテラシーと、「明らかに精度が落ちるプロンプト」を改善できるようになること</strong>に目的を絞っています。' },
        { type: 'p', text: '自分自身が勉強を好きになれなかったので、楽しく触れて学べる形にしたかった、というのが出発点です。加えて、<strong>Talk AI を今後VR空間で動かすためのテスト</strong>も兼ねています。そして単純に、ゲームが作りたかった。' },
        { type: 'h', text: '機能' },
        { type: 'ul', items: [
          'ローカルLLMに指示を出して、迷路をクリアさせる',
          'ステージビルダー',
          'VRMスタジオ。自分のVRMを読み込んでプレイできる',
          'AIチャット。ヘルプやAI活用について質問できる',
          'AIクイズ。クイズ形式でAI活用を学べる'
        ]},
        { type: 'gallery', items: [
          { src: 'images/promptgolf/gif1_gameplay.gif', caption: 'プレイの流れ' },
          { src: 'images/promptgolf/shot1_typing.png', caption: 'AIへの指示入力' },
          { src: 'images/promptgolf/shot2_clear.png', caption: 'クリア判定とスコア' },
          { src: 'images/promptgolf/shot4_builder.png', caption: 'ステージビルダー' },
          { src: 'images/promptgolf/shot3_vrm.png', caption: 'VRMスタジオ' },
          { src: 'images/promptgolf/shot5_chat.png', caption: 'AIチャット' },
          { src: 'images/promptgolf/shot6_quiz.png', caption: 'AIクイズ' }
        ]},
        { type: 'h', text: '工夫点' },
        { type: 'h3', text: 'あえて容量の小さいLLMを採用した' },
        { type: 'p', text: '理由は2つあります。1つは応答速度を上げてUXを落とさないため。もう1つは学習効果のためです。<strong>曖昧な指示でも動いてしまうと、「適切な指示を学ぶ」という意義が薄れます。</strong> 正確な指示でなければ正確に動かないよう、あえて小さいモデルを選びました。' },
        { type: 'h3', text: 'AIチャットの精度はRAGで担保した' },
        { type: 'p', text: 'チャットはある程度大きいモデルでないとハルシネーションが多く、使い物になりません。そこで RAG（手元の資料を根拠に答えさせる技術）を使い、本ゲームとAIに関する回答の質を高めています。RAGは完全ローカルで動くよう、複数を検証した上で、最も精度の高かった <strong>Ruri</strong> を採用しました。' },
        { type: 'h3', text: '自由度の追求' },
        { type: 'p', text: '既存のパズルゲームは、全ステージをクリアすると退屈になります。そこでステージビルダーを用意し、<strong>自分でステージを作って無限に遊べる</strong>ようにしました。お気に入りのVRMでプレイできることも、モチベーションの維持につながります。' },
        { type: 'h3', text: '配布時の工夫' },
        { type: 'p', text: 'どのゲーム配布サービスも容量に制限があり、ローカルLLMを同梱するのは困難です。そこで<strong>ゲーム本体だけを配布し、初回起動時にランチャーからローカルLLMをダウンロードする</strong>方式で解決しました。ユーザーが混乱しないよう、その旨は明記しています。' },
        { type: 'h', text: '学んだこと' },
        { type: 'ul', items: [
          '<strong>ローカルLLMの可能性と、なぜローカルLLMのサービスが少ないかを、同時に理解できた。</strong> 一方でコストゼロでAIを無限に使える魅力は大きいと感じ、将来ローカルLLMが発達することを考慮すると今後必須技術になりそうと感じた。',
          '一般的なPCでは大きいモデルを扱えず、<strong>企業のAPI経由のAIに精度で大幅に劣る</strong>',
          'デプロイ・リリース時に容量が大きくなり、<strong>手軽に試せる機会が減り、導入のハードルが上がる</strong>',
          'RAGや構造化出力で出力をコントロールすれば、精度はある程度改善する（今回は行っていないが、ファインチューニングと組み合わせれば、特定のタスクでは企業のAIより理想に近い回答が得られそう）',
          '<strong>ゲーム開発の基礎と知見。</strong> オブジェクト1つ1つの見た目、システム設計、デバッグの難しさを学んだ'
        ]},
        { type: 'h', text: '動作環境' },
        { type: 'table',
          head: ['区分', '環境', '1指示あたりの時間'],
          rows: [
            ['快適', 'VRAM 8GB以上（RTX 3060 / 4060、RX 6600 など）', '約1〜3秒'],
            ['最低', 'VRAM 6GB（RTX 2060 / 3050 など）', '数秒〜十数秒'],
            ['非推奨', '内蔵GPU / GPU非搭載', '数十秒']
          ]},
        { type: 'h', text: '配布情報' },
        { type: 'ul', items: [
          '配布物：<code>promptgolf-windows-beta.zip</code> <strong>649MB</strong>',
          'AIモデル：初回起動時に<strong>約5.6GB</strong>を自動ダウンロード（以降オフラインで動作）',
          '必要な空き容量：<strong>約12GB</strong>',
          'バージョン：<code>2026.07.12-beta1</code>（β版）',
          '<strong>150ダウンロード突破</strong>で、オンラインのコース共有・新しいオブジェクト／ギミック追加を予定',
          'アンインストール方法は3通り：ゲーム内「設定 → AIモデル削除」／同梱の「AIモデルを削除.bat」／保存先パスを案内して手動削除'
        ]},
        { type: 'note', text: '※ 紹介動画・スクリーンショット：アリシア・ソリッド © DWANGO Co., Ltd. ／ ナレーション：VOICEVOX 春日部つむぎ' },
        { type: 'links', items: [
          { label: 'PromptGolf 紹介動画（YouTube）', url: 'https://youtu.be/p-gdboxBYeA' },
          { label: 'itch.io でダウンロード', url: 'https://kmt1379.itch.io/promptgolf' },
          { label: 'GitHub：PromptGolf', url: 'https://github.com/kmtkzy1379/PromptGolf' }
        ]}
      ]
    },

    {
      id: 'talkai',
      pickup: true,
      title: 'Talk AI',
      sub: 'リアルタイムで会話できるAIシステム',
      tags: ['マルチエージェント', 'RAG', '画面認識', 'TTS / STT'],
      status: '4作目・現行',
      cover: 'Talk-AI-images/web/Talk-AI-8bit-icon.webp',
      blocks: [
        { type: 'h', text: '概要' },
        { type: 'p', text: 'リアルタイムで会話できるAIシステムです。従来のAIと違い1問1答ではなく、<strong>AIのほうから話しかけてきます。</strong> ほかに画面認識や、簡単なタスク実行もできます。' },
        { type: 'links', items: [
          { label: 'Talk AI デモ動画（YouTube）', url: 'https://youtu.be/9uKrJzXXlYI' }
        ]},
        { type: 'h', text: 'なぜ作ったか' },
        { type: 'p', text: 'AIは急速に進化していますが、<strong>まだ人間と間違えるほど会話が上手ではありません。</strong> そこで人間の心理や脳機能を模倣すれば、より人間らしく、曖昧な指示も汲み取り、高速に応答できるのではないかと考えました。人間と同等のレベルで会話できるAIができれば、<strong>対人会話が苦手な人の支援やエンタメ領域に使え、世界をより面白くできる</strong>と思っています。' },
        { type: 'p', text: 'もう1つの理由は、作り直しです。このプロダクトは私が<strong>最初に作り始めた作品の4作目</strong>にあたります。' },
        { type: 'table',
          head: ['', '作り方'],
          rows: [
            ['1作目', '最初の実装'],
            ['2作目', 'リポジトリは分けたが、1作目のコードを引き継いで成長させた'],
            ['3作目', '2作目と、画面認識（VLM）のリポジトリを統合した'],
            ['<strong>4作目（本作）</strong>', '<strong>コードの引き継ぎはなく、完全に1から作り直した。ロジック自体が違う</strong>']
          ]},
        { type: 'p', text: '3作目までは前のコードを土台に積み上げてきましたが、初期から作り続けてきたぶんコードが複雑化した部分があり、技術選定そのものを変えたい箇所も出てきました。<strong>知見のある状態で1から作り直すほうが、より高いクオリティのプロダクトになる</strong>と判断し、4作目はコードを一切引き継がずに書き直しています。' },
        { type: 'h', text: '機能' },
        { type: 'ul', items: [
          '<strong>自律的発話。</strong> AIのほうから話しかけてくる',
          '<strong>フィードバック機能。</strong> 会話を分析し、現在の状態・会話の要約・未来の予測を、FEPを模倣した形でフィードバックする',
          '<strong>RAGによる長期記憶。</strong> フィードバックをRAGとして使うことで、その時の状況を思い出せる（エピソード記憶）',
          '<strong>直近会話の短期記憶。</strong> 直前の会話をそのまま利用し、文脈と現在の記憶を鮮明に保持する',
          '<strong>画面認識。</strong> 常時撮り続けた画面から、変化したときだけ直近の数枚をAIに渡し、「変化前→変化後」を見比べさせて何が起きたかを認識する。画面に触れた会話ができ、体験を共有できる',
          '<strong>タスク実行。</strong> PCの状態や日付の確認、検索などができる。自律的にタスクを実行できるため、ユーザーの意図を汲み取って動く基盤になっている',
          'そのほか、リアルタイム会話を可能にするTTS・STT、ストリーム音声合成など'
        ]},
        { type: 'h', text: '工夫点：技術選定' },
        { type: 'p', text: '<strong>複数のアイデアを出し、実際に試して確認した上で技術を選んでいます。</strong>' },
        { type: 'p', text: '<strong>例1：埋め込み</strong>（テキストを数値に変換する処理）では、<code>text-embedding-3-small</code> や <code>ruri-v3</code> など複数を試し、最も精度が高いと感じたものを採用しました。' },
        { type: 'p', text: '<strong>例2：画面認識</strong>では、①画像1枚を分析させる ②YOLOやOpenCVなど低レイヤーの手法を複数組み合わせて分析させる ③複数枚をまとめて分析させる——を試し、<strong>ハルシネーションが少なく、動きを理解できる「複数枚まとめて分析」</strong>を採用しました。' },
        { type: 'p', text: 'ほかの技術も、同様に複数試した上で採用しています。' },
        { type: 'h', text: '工夫点：画面認識は「変化したら撮る」ではなく「常に撮って、変化したときだけAIに見せる」' },
        { type: 'p', text: '専用スレッドが<strong>2fps（0.5秒間隔）で画面を撮り続け</strong>、直近6枚をバッファに保持しています。各フレームは<strong>pHash（知覚ハッシュ）</strong>で前回と比較し、差が閾値を超えたときだけAIを呼びます。' },
        { type: 'p', text: '判定自体は画像処理レベルの軽い計算なので、<strong>画面が止まっている間はAIの呼び出しが一切発生せず、コストがかかりません。</strong>' },
        { type: 'p', text: '変化を検出したら、バッファから<strong>直近4枚</strong>を切り出してAIに渡します。バッファには変化する前のフレームも入っているため、<strong>AIは「変化前 → 変化後」を時系列で見比べ、何がどう変わったかを説明できます。</strong>' },
        { type: 'p', text: 'あわせて、暴走を防ぐ制御を入れています。' },
        { type: 'ul', items: [
          '<strong>AI呼び出しは常に1本だけ。</strong> 実況中に変化が重なっても積み上げず、終わってから最新の状態で1回だけ追いかける',
          '<strong>呼び出しは最短1秒間隔。</strong> 動画再生のように変化が続く場面でも、呼び出し回数が跳ね上がらない'
        ]},
        { type: 'h', text: '工夫点：RAGは「連想想起する長期記憶」として設計した' },
        { type: 'p', text: '記憶の単位を、ユーザーの発言そのものではなく、<strong>フィードバックLLMが毎ターン書く「内省」</strong>にしています。要約・感情・次の予測・予測差・話題タグを1セットで保存します。' },
        { type: 'ul', items: [
          '<strong>圧縮して埋め込み、展開して注入する。</strong> 検索キーにするのは要約とタグだけ（感情や予測まで入れると、ユーザーの発話との関連度が薄まるため）。実際に渡すのは感情・予測込みの完全版',
          '<strong>件数を3000件から500件に絞った。</strong> 前作は件数が多すぎて過去に逸れやすかった。500件ならデータベースを使わず全件計算が数msで終わる',
          '<strong>関連度が低い記憶は足切りする。</strong> 前作最大の症状「いま話していることと関係ない過去を持ち出す」への直接の対策',
          '<strong>沈黙時は別ロジックにした。</strong> 関連1件＋ランダム1件＋印象的だった1件を混ぜる。さらに<strong>直近10分以内に書かれた記憶は除外</strong>（実測で、関連枠の68%が5分以内の自分の内省で埋まっていた）'
        ]},
        { type: 'h', text: 'テスト（CI/CD）' },
        { type: 'p', text: '<strong>AIが考案した、11秒で完走できる434項目のテスト</strong>に加え、<strong>私が考案した、実際に起動してAIが評価する20項目のE2Eテスト</strong>を使用しています。さらに機能が増えるごとに数日運用してみて、バグや気になる点がないかを<strong>実際に人間がテストすること</strong>も徹底しています。' },
        { type: 'h', text: 'AI出力とシステムの線引き' },
        { type: 'p', text: 'AIは「画面に何が映っているか」「どうタスクを進めるか」といった、ルールベースでは限界のある処理を実装できます。しかし<strong>何でもかんでもAIに任せると、システムプロンプトが膨大化し、コストが増大し、システム速度が低下します。</strong> また<strong>AIは統計的・確率的・数理的に出力を出すため、絶対的な処理ができません。</strong>' },
        { type: 'p', text: 'そのため、<strong>強制したい部分やルールベースで代用できる部分はなるべくルールベースで実装し、臨機応変な対応が必要な部分にだけAIを担わせています。</strong>' },
        { type: 'h', text: 'マルチエージェント' },
        { type: 'p', text: '人間の脳は、部位ごとに担当する機能が違います。AIも同じで、複数の仕事を単一のAIに任せるのではなく、<strong>それぞれの仕事に最適なモデルを担当させることで、高速で精度の良い出力が得られます。</strong> それらを組み合わせることで、人間の脳機能を模倣しています。' },
        { type: 'h', text: '学んだこと' },
        { type: 'ul', items: [
          '<strong>レガシー化したプロダクトは、一度アーキテクチャから書き起こし、クリーンに実装し直す必要がある</strong>',
          'AIの得意・不得意と、プロンプトエンジニアリングへの深い理解',
          '<strong>実際に人間が動かすことで、プロダクトの品質担保と技術選定の質が上がる</strong>'
        ]},
        { type: 'h', text: 'リポジトリ・デモ動画' },
        { type: 'links', items: [
          { label: 'GitHub：Talk AI（4作目・現行）', url: 'https://github.com/kmtkzy1379/TalkAI' },
          { label: '4作目 Talk AI デモ動画（YouTube）', url: 'https://youtu.be/9uKrJzXXlYI' },
          { label: '3作目 Eve AI + VLM デモ（YouTube）', url: 'https://www.youtube.com/watch?v=I9cAP766aQw' },
          { label: '2作目 Eve AI デモ（YouTube）', url: 'https://www.youtube.com/watch?v=sACIvKWCAHc' },
          { label: '1作目 AI VTuber デモ（YouTube）', url: 'https://www.youtube.com/watch?v=xfwJvJJUYtA' },
          { label: 'GitHub：3作目 Eve AI + VLM', url: 'https://github.com/kmtkzy1379/portfolio8-VLM-AI' },
          { label: 'GitHub：2作目 Eve AI', url: 'https://github.com/kmtkzy1379/portfolio7-AI' },
          { label: 'GitHub：1作目 AI VTuber', url: 'https://github.com/kmtkzy1379/portfolio1-AItuber' },
          { label: 'GitHub：画面認識（VLM単体）', url: 'https://github.com/kmtkzy1379/vlm' }
        ]}
      ]
    },

    {
      id: 'my-ai',
      pickup: true,
      title: 'My-AI',
      sub: '高解像度のESを半自動で生成するAIシステム',
      tags: ['RAG', 'LLM', '設計'],
      status: 'Relicのインターンで題材として提出',
      sprite: 'myai',
      blocks: [
        { type: 'h', text: '概要' },
        { type: 'p', text: '自分の情報や文章をもとに、<strong>解像度の高いエントリーシートを半自動で生成する</strong>AIシステムです。Relicのインターンでも題材として提出しました。' },
        { type: 'quote', text: '<strong>注意：提出する文章は、必ず自分で修正する必要があります。</strong>' },
        { type: 'h', text: 'なぜ作ったか' },
        { type: 'p', text: 'ES作成は面倒だったり時間がなかったりで、<strong>本当は出したい企業なのに応募できなかったり、適当に書いて出してしまう</strong>ことがあります。これは機会損失だと感じました。そこで、<strong>自分の情報や文章からESを作れば、解像度の高いものを生成できる</strong>と考えました。' },
        { type: 'p', text: 'ワンキャリアなどもES生成サービスを提供しています。実際に使ってみましたが、<strong>個人の情報がほとんど入らないため、ありきたりな文章しか出てこず、結局ほぼ書き直しになりました。</strong> ここに、自分で作る意味があると考えています。' },
        { type: 'h', text: '工夫した点：人間が直す工程を、システムの一部にした' },
        { type: 'p', text: '<strong>当然、AIは100%正しいことを出力できません。</strong> そのため最終的には人間が確認し、修正する必要があります。' },
        { type: 'p', text: 'それを前提に、<strong>出力された文章をその場で編集でき、編集した内容を再びRAGに入れることで、使うほど賢くなる</strong>設計にしました。人間が直す工程を「面倒な後始末」ではなく、<strong>システムが良くなるための入力</strong>として組み込んでいます。' },
        { type: 'h', text: '工夫した点：他社ESの扱いは「全部除外」ではなく「使い回せない部分だけ締める」' },
        { type: 'p', text: '過去に他社向けに書いたESも、<strong>実績・考え方・文章の癖といった部分は使い回せます。</strong> むしろ材料として貴重です。問題になるのは、志望動機のように<strong>その企業でしか通用しない内容</strong>だけ。' },
        { type: 'p', text: 'そこで、<strong>設問の種別で切り分けました。</strong>' },
        { type: 'ul', items: [
          '<strong>ガクチカ・自己PRなど（実績や考え方）</strong> → 企業タグに関係なく、すべて使う',
          '<strong>志望動機</strong> → 対象企業に登録されたものだけ使う',
          '<strong>対象企業が未指定のときは、志望動機を全部止める</strong> — フィルタが無効化されるのを防ぐためのフェイルセーフ'
        ]},
        { type: 'p', text: 'この絞り込みは検索の前段で許可リストを作る形で行い、<strong>事実チャンネル・文体チャンネルの両方に常時かけています。</strong>' },
        { type: 'p', text: '<strong>すり抜けた分は、プロンプト側のルールで受けます。</strong> 種別の分類ミスなどで漏れる可能性があるためです。ここも一律禁止にはしていません。' },
        { type: 'ul', items: [
          '<strong>実体験としての社名は書いてよい</strong>（インターン先・アルバイト先・研究室など）。経歴の一部だから',
          'ただし、<strong>その会社への志望理由や賛辞を、別の企業向けの文章に流用しない</strong>',
          '企業固有の内容は、こちらが入力した<strong>「企業メモ」の事実だけを根拠にする。</strong> 無ければ断定を避け、自分の動機や経験を中心に書く'
        ]},
        { type: 'p', text: '<strong>そのうえで、完全ではないと理解して使っています。</strong> LLMの出力は確率的なので、他社特有の言い回しが混じることはあります。少量であれば実用上は問題ないと判断した上で運用しています。' },
        { type: 'links', items: [
          { label: 'GitHub：My-AI', url: 'https://github.com/kmtkzy1379/My-AI' }
        ]}
      ]
    },

    {
      id: 'promptlore',
      pickup: false,
      title: 'PromptLore',
      sub: 'AIの設定を共有できるSNS',
      tags: ['Web', 'SNS', 'Fly.io'],
      status: '稼働中・告知なし',
      cover: 'icon.png',
      blocks: [
        { type: 'h', text: '概要' },
        { type: 'p', text: 'skills や .md といった、<strong>AIの設定ファイルを共有できるSNS</strong>です。' },
        { type: 'img', src: 'icon.png', caption: 'PromptLore アイコン', size: 'icon' },
        { type: 'h', text: 'なぜ作ったか' },
        { type: 'p', text: 'skills や .md は、基本的に GitHub で配布されます。しかし<strong>非エンジニアには、GitHub 自体を知らない人もいます。</strong> AIを使うのはエンジニアだけではないので、<strong>非エンジニアでも直感的に、その状況に合ったAIの設定ができるようになればいい</strong>と考えました。需要があるかもしれない、という見立てです。' },
        { type: 'h', text: '現状：運用していません' },
        { type: 'p', text: 'デプロイはしてありますが、<strong>告知もせず、現在は運用していません。</strong>' },
        { type: 'p', text: '告知の直前に、<strong>SNSは人がいて初めて機能するものであり、個人では活性化するほどの集客ができない。それでは訪問者にとって価値のないサイトになる</strong>と考えたためです。' },
        { type: 'p', text: '<strong>プロダクトの価値とは何かを考えさせられる、良い機会になりました。</strong>' },
        { type: 'links', items: [
          { label: 'サイト：promptlore.fly.dev', url: 'https://promptlore.fly.dev/' },
          { label: 'GitHub：PromptLore', url: 'https://github.com/kmtkzy1379/PromptLore' }
        ]}
      ]
    },

    {
      id: 'rl',
      pickup: false,
      title: '強化学習の実験',
      sub: '身体的・神経的制約がAIの歩行学習に与える影響の検証',
      tags: ['強化学習', 'Unity ML-Agents', '実験'],
      status: '検証レポート',
      blocks: [
        { type: 'p', text: 'AIに「体が重い」「反応が遅い」というハンデを与えたら、どんな歩き方を学ぶか。強化学習で検証し、<strong>「ある機能の制約が、別の機能の過剰な発達や独自の戦略を生む」</strong>という、人間のニューロダイバーシティにも通じる現象をAIが自律的に再現しました。' },
        { type: 'h', text: '実験の組み方' },
        { type: 'p', text: '<strong>AIに与える目標（点数のつけ方）は3体とも完全に同じにし、変えたのは体の条件だけ</strong>です。こうしないと、歩き方の違いが体の制約によるものか、目標の設定によるものかを区別できなくなります。' },
        { type: 'p', text: '与えた目標は3つ。<strong>前に進むと加点／転ぶと減点して終了／生きている間ずっと少しずつ加点</strong>です。' },
        { type: 'h', text: '変えた体の条件' },
        { type: 'p', text: '比較したのは <strong>Normal（制約なし）／Scale Model（体が重い）／Delayed Model（反応が遅い）</strong> の3体です。Normal を基準に、以下の2つの条件だけを変えました。' },
        { type: 'ul', items: [
          '<strong>Scale Model（体が重い）：</strong> 身長を1.5倍にすると、体重は体積で効くので 1.5³＝3.375倍。一方で筋力は断面積で効くため 1.5²＝2.25倍にしかならない。<strong>大きくなるほど相対的に非力になる</strong>という物理法則から数値を決めています',
          '<strong>Delayed Model（反応が遅い）：</strong> 次の動きを決める間隔を標準の2倍にし、神経の伝達が遅い状態を再現'
        ]},
        { type: 'h', text: '結果' },
        { type: 'ul', items: [
          '<strong>Scale Model：</strong> 「ゆっくり歩くが転びにくい」重心の低い省エネ型フォームを獲得',
          '<strong>Delayed Model：</strong> 「転ぶまでの短時間に大股で距離を稼ぐ」ハイリスク型の戦略を獲得。合計得点は最高なのに、転ばずにいられた時間は最短でした。<strong>反応の遅さを補うため、1回の行動で稼ぐ量を最大化する方向に特化した</strong>と整理しています'
        ]},
        { type: 'p', text: '<strong>「反応が遅ければ慎重になるだろう」という予想は外れました。</strong> 遅いからこそ1回の行動で稼ぐしかなく、かえって投機的になる。制約は性能を下げるだけでなく、<strong>戦略そのものを別物に組み替える</strong>と分かった実験です。' },
        { type: 'gallery', items: [
          { src: 'images/cumulative_reward.png', caption: 'Cumulative Reward（合計得点）' },
          { src: 'images/episode_length.png', caption: 'Episode Length（転ばずにいられた時間）' },
          { src: 'images/training_loss.png', caption: 'Policy Loss（学習の推移）' }
        ]},
        { type: 'h', text: '実験動画・リポジトリ' },
        { type: 'links', items: [
          { label: '3モデルの比較（YouTube）', url: 'https://www.youtube.com/watch?v=8NeEWOQXfY8' },
          { label: 'Normal モデル（YouTube）', url: 'https://www.youtube.com/watch?v=5l4HtgaiFiQ' },
          { label: 'Delayed モデル・反応が遅い（YouTube）', url: 'https://www.youtube.com/watch?v=87Y8skBoFfM' },
          { label: 'Scale モデル・体が重い（YouTube）', url: 'https://www.youtube.com/watch?v=1UfdKVYhGY4' },
          { label: 'GitHub：強化学習の実験', url: 'https://github.com/kmtkzy1379/portfolio5-RL' }
        ]}
      ]
    },

    {
      id: 'lora',
      pickup: false,
      title: 'LoRA ファインチューニング',
      sub: 'AIに性格を覚えさせる実験',
      tags: ['LoRA', '量子化', 'Hugging Face'],
      status: 'モデルカード公開',
      blocks: [
        { type: 'h', text: '概要' },
        { type: 'p', text: 'たった100件のデータで、AIに特定の性格を覚えさせる実験です。' },
        { type: 'h', text: '失敗と学び' },
        { type: 'p', text: '<strong>覚えさせすぎました。</strong><br>一般知識のほうを忘れてしまい、性格だけを強く覚えた結果、<strong>学習データそのままの回答しか返さなくなりました。</strong>' },
        { type: 'p', text: '学習の強さと繰り返し回数を下げる調整をしたところ、<strong>丸暗記ではなく応用の効く状態</strong>に改善しました。<br>（rank 32→8 ／ epochs 2→1 ／ 学習率 2e-4→1e-4）' },
        { type: 'p', text: '<strong>手持ちのPCで動かしました。</strong><br>モデルの重みを4bitまで圧縮する手法（量子化）を使い、家庭用GPUでも140億パラメータのモデルを学習できるようにしています。' },
        { type: 'gallery', items: [
          { src: 'images/derived/lora-train.png', caption: '学習時のログ' },
          { src: 'images/derived/lora-eval.png', caption: '評価指標の推移' },
          { src: 'images/derived/lora-chat.png', caption: '学習後のモデルとの会話デモ' }
        ]},
        { type: 'links', items: [
          { label: 'Hugging Face：portfolio6-FT（モデルカード）', url: 'https://huggingface.co/hkucdshch/portfolio6-FT' }
        ]}
      ]
    },

    {
      id: 'basics',
      pickup: false,
      title: '基礎シリーズ',
      sub: '機械学習 / 深層学習 / Unity3D',
      tags: ['Python', 'TensorFlow', 'Unity', 'C#'],
      status: 'ブラウザで遊べる3DRPGあり',
      blocks: [
        { type: 'p', text: '学習の土台を作るために制作した3本です。<strong>自分で論理を理解できているかを確かめるため、この3本はAIによるコード生成を使わずに実装しました。</strong>' },
        { type: 'ul', items: [
          '<strong>機械学習基礎：</strong> データの前処理からモデルの構築・精度評価・グラフ化まで、ひと通りを実装（Python / scikit-learn / pandas / matplotlib）',
          '<strong>深層学習基礎：</strong> ニューラルネットワークを組み立て、学習させ、正解率を検証するまでを実装。あわせて、<strong>どの数字をどの数字と取り違えたか</strong>を表にして確認するところまで（TensorFlow / Keras）',
          '<strong>Unity3Dゲーム開発基礎：</strong> 移動・攻撃・敵の思考・HPバーを自分で書き、ブラウザで遊べる3DRPGにまとめた（Unity / C#）'
        ]},
        { type: 'h', text: '3DRPG：操作方法' },
        { type: 'table',
          head: ['キー', '動作'],
          rows: [
            ['↑ ↓ ← →', '移動'],
            ['Shift', 'ダッシュ'],
            ['Space', 'ジャンプ'],
            ['A', '左カメラ回転'],
            ['D', '右カメラ回転'],
            ['C', '攻撃']
          ]},
        { type: 'links', items: [
          { label: '▶ 3DRPGをブラウザで遊ぶ', url: 'https://kmtkzy1379.github.io/portfolio-game/' },
          { label: 'GitHub：機械学習基礎', url: 'https://github.com/kmtkzy1379/portfolio2-ML' },
          { label: 'GitHub：深層学習基礎', url: 'https://github.com/kmtkzy1379/portfolio3-DL' },
          { label: 'GitHub：Unity3D基礎', url: 'https://github.com/kmtkzy1379/portfolio4-UnityGame' }
        ]}
      ]
    }
  ],

  /* ---------------- インターン・活動履歴（3） ----------------
     1社1項目にすると読む場所が増え、小松マスターが遠のく。
     長期インターン／短期インターン／イベント の3つにまとめている。 */
  history: [
    {
      id: 'ohmyteeth',
      main: true,
      title: 'oh my teeth',
      role: 'AIエンジニア・インターン',
      period: '2026年5月 〜 現在',
      blocks: [
        { type: 'h', text: '組織のオンボーディングを企画・先導' },
        { type: 'p', text: '参画当時は研修制度がなく、自分自身が進め方に困りました。その経験をもとにメンバーを集めて相談し、企画を立ち上げ。<strong>5名のメンバーの指揮を取って企画書を作成し、CEOに打診して、業務時間内で実施する許可を得ました。</strong>' },
        { type: 'h', text: '機械学習環境のオンボーディングを企画・先導' },
        { type: 'ul', items: [
          'Google Colab の導入提案',
          'dry run などでコストを抑えながら細かく検証する運用の確立',
          'Jupyter Notebook とランタイムテンプレートの作成',
          '長期の運用コストを踏まえた、オンプレミスSSHサーバー購入の打診',
          'SSHサーバーの構築'
        ]},
        { type: 'h', text: '実務でのエンジニアリングとチーム開発' },
        { type: 'p', text: '企業の大規模なコードの理解を進め、課題を発見して実装。プルリクエスト、チームでの進捗報告、担当分担といった、<strong>実務でのエンジニアリングとチーム開発の基礎</strong>を身につけました。' },
        { type: 'h', text: '結果' },
        { type: 'p', text: '信用を得て、オンボーディングやコスト管理に携わるなど、<strong>裁量を持って活動できています。</strong>' }
      ]
    },
    {
      id: 'short-intern',
      title: '短期インターン',
      role: 'SmartHR ／ 株式会社Relic ／ 三栄ハイテックス',
      period: '2026年・計4day',
      blocks: [
        { type: 'h', text: 'SmartHR（2day）' },
        { type: 'p', text: '<strong>LT登壇会</strong>と、<strong>GitHub・AI活用の研修</strong>に、1dayずつ計2day参加しました。' },
        { type: 'h', text: '株式会社Relic（1day）' },
        { type: 'p', text: '1day のインターンに参加しました。<strong>「My-AI（高解像度のESを半自動で生成するAIシステム）」を題材として提出</strong>しています。' },
        { type: 'links', items: [
          { label: '作品を見る：My-AI', url: '#/works/my-ai', internal: true }
        ]},
        { type: 'h', text: '三栄ハイテックス（1day）' },
        { type: 'p', text: '1day のインターンに参加しました。' }
      ]
    },
    {
      id: 'events',
      title: 'イベント',
      role: 'ミーツカンパニー ／ サポーターズ ／ 技育祭2026春',
      period: '2026年',
      blocks: [
        { type: 'h', text: 'ミーツカンパニー：MVP選出' },
        { type: 'p', text: '<strong>ガクチカや実績ではなく、人柄とビジネス視点を企業の方々の投票で評価いただき、MVPに選出されました。</strong>' },
        { type: 'h', text: 'サポーターズ：エンジニア1on1面談《ハイクラス》' },
        { type: 'p', text: 'エンジニア1on1面談《ハイクラス》に <strong>選考通過</strong>し、参加しました。' },
        { type: 'h', text: 'サポーターズ 技育祭2026春：関東アンバサダー' },
        { type: 'p', text: '技育祭2026春の <strong>関東アンバサダー</strong>を務めました。' }
      ]
    }
  ]
};

/* ---------------- ドット絵スプライト（24×24） ----------------
   '#' = 明るい色 / '+' = 中間色 / '.' = 背景
   My-AI：ヘッドセットをつけたキャラクター（手描きドット絵）
   ------------------------------------------------------------ */
DATA.sprites = {
  myai: [
    '........................',
    '......############......',
    '.....##############.....',
    '....################....',
    '...####++++++++++####...',
    '..###++++++++++++++###..',
    '..###++++++++++++++###..',
    '.##.##++++++++++++##.##.',
    '.##.##++..++++..++##.##.',
    '.##.##++..++++..++##.##.',
    '.##.##++++++++++++##.##.',
    '..###++++++..++++++###..',
    '...####++++++++++####...',
    '.....##############.....',
    '.......##########.......',
    '..........####..........',
    '..........####..........',
    '......############......',
    '....################....',
    '..##++++++++++++++++##..',
    '.##++++++++++++++++++##.',
    '.##+++++++####+++++++##.',
    '.##+++++++####+++++++##.',
    '.######################.'
  ]
};

/* 閲覧チェック対象の全ID（ゲージの分母） */
DATA.allItemIds = []
  .concat(DATA.introItems.map(function (v) { return 'intro:' + v.id; }))
  .concat(DATA.works.map(function (v) { return 'work:' + v.id; }))
  .concat(DATA.history.map(function (v) { return 'hist:' + v.id; }));
