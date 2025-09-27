# Living Sustainability Front End

### Installation

Follow these steps to install and run the extension locally:

1. **Install dependencies:** Run `npm install` and `npm install extension-cli` in the root directory.
2. **Build the extension:** Run `npx xt-build` in the root directory. This command generates a `release.zip` containing the packaged extension.
3. **Extract the build:** Unzip the generated `release.zip` to create a `release` folder.
4. **Load in Chrome:**
    - Navigate to `chrome://extensions/` in your Chrome browser
    - Go to the "My extensions" section
    - Enable "Developer Mode" (toggle in the top right corner)
    - Click "Load unpacked" button (top left)
    - Select the release folder you extracted
5. The Living Sustainability front end is now installed and ready to use locally!

#### Updating the Extension
When you make changes to the code:
1. Delete the existing `release` folder (if present)
2. Run `npx xt-build` to rebuild
3. Unzip the new `release.zip`
4. Refresh the extension in Chrome Extensions to load your changes

#### Adding New Scripts
When adding new JavaScript files to the `src` directory, remember to update the `js_bundles` array in `package.json` to include your new script. Files not listed in js_bundles will not be included in the build.

This extension was created with [Extension CLI](https://oss.mobilefirst.me/extension-cli/)!
