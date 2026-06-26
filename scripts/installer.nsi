Unicode true
!include "MUI2.nsh"

Name "scrcpy GUI"
OutFile "..\website\download\scrcpy-gui-setup.exe"
InstallDir "$PROGRAMFILES64\scrcpy GUI"
RequestExecutionLevel admin

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_LANGUAGE "SimpChinese"

Section "Install"
  SetOutPath "$INSTDIR"
  File /r "..\dist\scrcpy-gui-portable\*.*"

  CreateShortCut "$DESKTOP\scrcpy GUI.lnk" "$INSTDIR\scrcpy GUI.exe"
  CreateDirectory "$SMPROGRAMS\scrcpy GUI"
  CreateShortCut "$SMPROGRAMS\scrcpy GUI\scrcpy GUI.lnk" "$INSTDIR\scrcpy GUI.exe"
  CreateShortCut "$SMPROGRAMS\scrcpy GUI\Uninstall.lnk" "$INSTDIR\uninstall.exe"

  WriteUninstaller "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "DisplayName" "scrcpy GUI"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "DisplayIcon" "$INSTDIR\scrcpy GUI.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI" "Publisher" "scrcpy GUI"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  Delete "$DESKTOP\scrcpy GUI.lnk"
  RMDir /r "$SMPROGRAMS\scrcpy GUI"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\scrcpy GUI"
SectionEnd
