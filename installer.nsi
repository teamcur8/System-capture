; Echo Audio Streamer - Professional NSIS Installer
; Creates a proper setup.exe installer

!define APP_NAME "Echo Audio Streamer"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "Echo Development Team"
!define APP_EXE "Echo - Audio Streamer.exe"
!define APP_ID "com.echo.audiostreamer"

; Include modern UI
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "WinVer.nsh"

; General
Name "${APP_NAME}"
OutFile "Echo-Audio-Streamer-Setup-${APP_VERSION}.exe"
InstallDir "$PROGRAMFILES\${APP_NAME}"
InstallDirRegKey HKLM "Software\${APP_NAME}" "Install_Dir"

; Request application privileges
RequestExecutionLevel admin

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "build\icon.ico"
!define MUI_UNICON "build\icon.ico" 

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "English"

; Installer Sections
Section "Main Application" SecMain
    SetOutPath "$INSTDIR"

    DetailPrint "Copying application files..."
    ; Copy entire Electron build output
    File /r "dist\win-unpacked\*.*"
    ; Copy license into install dir
    File "LICENSE.txt"

    ; Verify the main executable was copied
    IfFileExists "$INSTDIR\Echo - Audio Streamer.exe" +3
        MessageBox MB_OK|MB_ICONSTOP "Error: Failed to copy application files!$\r$\nPlease try running the installer as Administrator."
        Abort

    ; Create application data directories
    CreateDirectory "$LOCALAPPDATA\${APP_NAME}\logs"
    CreateDirectory "$LOCALAPPDATA\${APP_NAME}\config"

    ; Create desktop shortcut
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\Echo - Audio Streamer.exe"

    ; Create start menu shortcuts
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\Echo - Audio Streamer.exe"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe"

    ; Write uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; Registry info for Add/Remove Programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayIcon" "$INSTDIR\Echo - Audio Streamer.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "Publisher" "${APP_PUBLISHER}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayVersion" "${APP_VERSION}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoRepair" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "EstimatedSize" 200000

    ; Registry info for app
    WriteRegStr HKLM "Software\${APP_NAME}" "Install_Dir" "$INSTDIR"
SectionEnd

; Uninstaller Section
Section "Uninstall"
    RMDir /r "$INSTDIR"
    Delete "$DESKTOP\${APP_NAME}.lnk"
    RMDir /r "$SMPROGRAMS\${APP_NAME}"
    RMDir /r "$LOCALAPPDATA\${APP_NAME}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
    DeleteRegKey HKLM "Software\${APP_NAME}"
SectionEnd

; Function to check system requirements
Function .onInit
    ${If} ${AtLeastWin10}
    ${Else}
        MessageBox MB_OK|MB_ICONSTOP "This application requires Windows 10 or newer.$\r$\nThe application may not work correctly."
    ${EndIf}
FunctionEnd

; Function to run the application after installation
Function .onInstSuccess
    MessageBox MB_YESNO "Installation completed successfully!$\r$\nWould you like to start ${APP_NAME} now?" IDYES LaunchApp
    LaunchApp:
        Exec "$INSTDIR\Echo - Audio Streamer.exe"
FunctionEnd

; Function to handle installation failures
Function .onInstFailed
    MessageBox MB_OK|MB_ICONSTOP "Installation failed!$\r$\nPlease try:$\r$\n1. Run as Administrator$\r$\n2. Ensure enough disk space$\r$\n3. Disable antivirus temporarily$\r$\n4. Try another install location"
FunctionEnd
