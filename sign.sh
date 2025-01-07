APP_PATH=./out/Xopilot-darwin-arm64/Xopilot.app

xattr -cr $APP_PATH
codesign --force --deep --sign - $APP_PATH
codesign --verify --deep --strict $APP_PATH