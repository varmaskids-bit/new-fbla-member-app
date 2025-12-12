Run the simple upload server for development

Requirements: Node.js

Install and start:

```bash
cd server
npm install
npm start
```

This will start a server on http://localhost:4000 with an /upload endpoint that accepts multipart/form-data (field name "file"). Uploaded files are available under /uploads/<filename>.


rm -rf node_modules
rm -rf ios/Pods ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*
npm cache clean --force
npm install
npx pod-install
npm start

Only admins see the role selector. Log in with the seeded admin (admin@chapter.org / pass123) to confirm.