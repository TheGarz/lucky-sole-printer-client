!macro preInit
    SetRegView 64
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\SightLine Print Client"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\SightLine Print Client"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\SightLine Print Client"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\SightLine Print Client"
!macroend

!macro customInstall
    ; Install Windows Service
    ExecWait '"$INSTDIR\resources\app\node_modules\.bin\node.exe" "$INSTDIR\resources\app\install-service.js"'
!macroend

!macro customUnInstall
    ; Stop and uninstall Windows Service
    ExecWait '"$INSTDIR\resources\app\node_modules\.bin\node.exe" "$INSTDIR\resources\app\uninstall-service.js"'
!macroend
