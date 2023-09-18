## Developer note

Use ```@vercel/ncc``` to compile code and all modules into one single file used for distribution.

```
npm i -g @vercel/ncc

ncc build src/index.js --license LICENSE.txt
```

The compiled file will be located under folder ```./dist```