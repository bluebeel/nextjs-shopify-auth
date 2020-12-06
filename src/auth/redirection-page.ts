type RedirectionParams = {
  origin: string;
  redirectTo: string;
  apiKey: string;
};

export default function redirectionScript({
  origin,
  redirectTo,
  apiKey,
}: RedirectionParams) {
  return `
    <script src="https://unpkg.com/@shopify/app-bridge@^1"></script> <script type="text/javascript">
      document.addEventListener('DOMContentLoaded', function() {
        // If the current window is the 'child', change the parent's URL with postMessage
          var AppBridge = window['app-bridge'];
          var createApp = AppBridge.default;
          var Redirect = AppBridge.actions.Redirect;
          var app = createApp({
            apiKey: "${apiKey}",
            shopOrigin: "${encodeURI(origin)}",
          });
          var redirect = Redirect.create(app);
          redirect.dispatch(Redirect.Action.REMOTE, "${redirectTo}");
      });
    </script>
  `;
}
