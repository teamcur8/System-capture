; Echo Audio Streamer - Professional NSIS Installer
; This creates a proper setup.exe installer like games and other applications

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
    
    ; Copy the pre-built Electron application
    DetailPrint "Copying application files..."
    File /r "dist\win-unpacked\*"
    
    ; Verify the main executable was copied
    IfFileExists "$INSTDIR\Echo - Audio Streamer.exe" +3
        MessageBox MB_OK|MB_ICONSTOP "Error: Failed to copy application files!$\r$\n$\r$\nPlease try running the installer as Administrator."
        Abort
    
    ; Create application data directories
    CreateDirectory "$LOCALAPPDATA\${APP_NAME}"
    CreateDirectory "$LOCALAPPDATA\${APP_NAME}\logs"
    CreateDirectory "$LOCALAPPDATA\${APP_NAME}\config"
    

    

    
    ; Create simple batch launcher
    FileOpen $0 "$INSTDIR\${APP_EXE}.bat" w
    FileWrite $0 '@echo off$\r$\n'
    FileWrite $0 'cd /d "$INSTDIR"$\r$\n'
    FileWrite $0 'start "" "Echo - Audio Streamer.exe"$\r$\n'
    FileClose $0
    
    ; Create desktop shortcut (direct executable)
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\Echo - Audio Streamer.exe" "" "$INSTDIR\Echo - Audio Streamer.exe" 0
    
    ; Create start menu shortcut (direct executable)
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\Echo - Audio Streamer.exe" "" "$INSTDIR\Echo - Audio Streamer.exe" 0
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
    

    
    ; Write uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    
    ; Registry information for add/remove programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayIcon" "$INSTDIR\Echo - Audio Streamer.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "Publisher" "${APP_PUBLISHER}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayVersion" "${APP_VERSION}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoRepair" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "EstimatedSize" 200000
    
    ; Registry information for the application
    WriteRegStr HKLM "Software\${APP_NAME}" "Install_Dir" "$INSTDIR"
SectionEnd

; Uninstaller Section
Section "Uninstall"
    ; Remove application files
    Delete "$INSTDIR\Echo - Audio Streamer.exe"
    RMDir /r "$INSTDIR\resources"
    RMDir /r "$INSTDIR\locales"
    Delete "$INSTDIR\*.pak"
    Delete "$INSTDIR\*.dll"
    Delete "$INSTDIR\*.bin"
    Delete "$INSTDIR\*.json"
    Delete "$INSTDIR\*.dat"
    Delete "$INSTDIR\*.html"
    Delete "$INSTDIR\*.txt"
    Delete "$INSTDIR\${APP_EXE}.bat"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"
    
    ; Remove shortcuts
    Delete "$DESKTOP\${APP_NAME}.lnk"
    RMDir /r "$SMPROGRAMS\${APP_NAME}"
    
    ; Remove application data
    RMDir /r "$LOCALAPPDATA\${APP_NAME}"
    
    ; Remove registry keys
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
    DeleteRegKey HKLM "Software\${APP_NAME}"
SectionEnd

; Function to check system requirements
Function .onInit
    ; Check Windows version
    ${If} ${AtLeastWin10}
        ; Windows 10 or newer - OK
    ${Else}
        MessageBox MB_OK|MB_ICONSTOP "This application requires Windows 10 or newer.$\r$\n$\r$\nYou are running an older version of Windows.$\r$\nThe application may not work correctly."
    ${EndIf}
    
    ; Check if required files exist
    IfFileExists "dist\win-unpacked\Echo - Audio Streamer.exe" +3
        MessageBox MB_OK|MB_ICONSTOP "Error: Application files are missing!$\r$\n$\r$\nPlease make sure the installer is complete and not corrupted."
        Abort
    
    IfFileExists "LICENSE.txt" +3
        MessageBox MB_OK|MB_ICONSTOP "Error: License file is missing!$\r$\n$\r$\nPlease make sure the installer is complete and not corrupted."
        Abort
FunctionEnd

; Function to run the application after installation
Function .onInstSuccess
    MessageBox MB_YESNO "Installation completed successfully!$\r$\n$\r$\nWould you like to start ${APP_NAME} now?" IDYES LaunchApp IDNO NoLaunch
    LaunchApp:
        Exec "$INSTDIR\Echo - Audio Streamer.exe"
    NoLaunch:
FunctionEnd

; Function to handle installation failures
Function .onInstFailed
    MessageBox MB_OK|MB_ICONSTOP "Installation failed!$\r$\n$\r$\nPlease try the following:$\r$\n1. Run the installer as Administrator$\r$\n2. Make sure you have enough disk space$\r$\n3. Temporarily disable antivirus software$\r$\n4. Try installing to a different location"
FunctionEnd
