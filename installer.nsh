!macro customInstall
  ; Install Windows Service
  ExecWait '"$INSTDIR\resources\app\node_modules\.bin\node.exe" "$INSTDIR\resources\app\install-service.js"'
!macroend

!macro customUnInstall
  ; Stop and uninstall Windows Service
  ExecWait '"$INSTDIR\resources\app\node_modules\.bin\node.exe" "$INSTDIR\resources\app\uninstall-service.js"'
!macroend
