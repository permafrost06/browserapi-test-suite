# browserapi test suite
## Instructions for running
1. Install dependencies
```sh
pnpm i
```
2. Start dev server
```sh
pnpm run dev
```
3. Open the site in browser.
4. Allow video autoplay and refresh the page.
5. Open the JS console to see the test results.

All the tests are in `src/main.ts` file.

Nginx reverse proxy config example:
```
location /cloud-tester {
    rewrite /cloud-tester/(.*) /$1  break;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass http://127.0.0.1:5173;
}
```
