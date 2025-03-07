# Welcome to your Expo app 👋

gerar build pra web:
npx expo export --platform web


fazer build local usando expo-dev:

cd android && ./gradlew app:bundleRelease


fazer build usando eas:

npx eas build --platform android --profile production (gera .aab)

npx eas build --platform android --profile release (gera .apk)

## implementar Vlibras


Exporte para web usando npx expo export --platform web

após isso entre na pasta dist

 <div vw class="enabled">
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>
  </div>
  <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
  <script>
    new window.VLibras.Widget('https://vlibras.gov.br/app');
  </script>
