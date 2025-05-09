# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


A short and clean step-by-step guide to go from a fresh local folder to committing and pushing to a specific branch on GitHub:
✅ 1. Go to your project folder

cd /path/to/your/project

✅ 2. Initialize Git

git init

✅ 3. Connect to GitHub repo

git remote add origin https://github.com/yourusername/your-repo.git

✅ 4. Checkout the branch you want to work on

If the branch already exists on GitHub:

git fetch origin
git checkout -b branch-name origin/branch-name

If you want to create a new branch:

git checkout -b new-branch-name

✅ 5. Track the branch (only needed once)

git push -u origin branch-name

📝 6. Make changes → Stage → Commit

git add .
git commit -m "Your commit message"

🚀 7. Push your changes

git push

🔁 8. After this, for future work

You only need:

git add .
git commit -m "Message"
git push
