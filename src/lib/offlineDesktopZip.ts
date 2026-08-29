import JSZip from "jszip";
import { OfflineBundleData, generateOfflineDesktopHTML } from "./offlineDesktopBundle";

export async function generateOfflineInstallationZip(data: OfflineBundleData): Promise<Blob> {
  const zip = new JSZip();

  const ownerName = data.profile.ownerName || "Jan Coetzee";
  const businessName = data.profile.tradingName || data.profile.companyName || "Fast-Books";
  const currentAppUrl = typeof window !== "undefined" ? window.location.href : "http://localhost:3000";

  // 1. Generate the Standalone Single-File Offline HTML Application
  const htmlContent = generateOfflineDesktopHTML(data);
  zip.file(`FastBooks_Offline_App.html`, htmlContent);

  // 2. Windows Batch Desktop Installer & Launcher
  const windowsBat = `@echo off
:: =========================================================================
:: Fast-Books PRO - Windows Offline Desktop Installer & Launcher
:: Proprietor: ${ownerName} - ${businessName}
:: =========================================================================
title Fast-Books Desktop Installer
color 0B
echo.
echo ========================================================================
echo   Installing Fast-Books Offline Desktop Application for ${ownerName}
echo ========================================================================
echo.

set CURRENT_DIR=%~dp0
set HTML_APP_PATH=%CURRENT_DIR%FastBooks_Offline_App.html
set SHORTCUT_NAME=Fast-Books Offline Desktop
set DESKTOP_PATH=%USERPROFILE%\\Desktop\\%SHORTCUT_NAME%.url

echo [1/3] Verifying offline application container...
if exist "%HTML_APP_PATH%" (
    echo       Found: %HTML_APP_PATH%
) else (
    echo       [WARNING] FastBooks_Offline_App.html not found in current folder!
)

echo.
echo [2/3] Creating Windows Desktop Shortcut...
(
echo [InternetShortcut]
echo URL=file:///%HTML_APP_PATH:\\=/%
echo IconIndex=0
echo IconFile=%SystemRoot%\\System32\\SHELL32.dll,13
) > "%DESKTOP_PATH%"

echo.
echo [3/3] Launching Fast-Books in Dedicated Desktop Window Mode...
echo.

start msedge --app="file:///%HTML_APP_PATH:\\=/%" || start chrome --app="file:///%HTML_APP_PATH:\\=/%" || start "" "%HTML_APP_PATH%"

echo ========================================================================
echo [SUCCESS] Fast-Books Offline Desktop is ready on your Desktop!
echo Double-click "%SHORTCUT_NAME%" anytime to work offline with zero internet.
echo ========================================================================
echo.
pause
`;
  zip.file("Install_Windows.bat", windowsBat);

  // 3. Windows Direct Runner Batch
  const runWindowsBat = `@echo off
:: Fast-Books Quick Launcher
title Fast-Books Offline
start msedge --app="file:///%~dp0FastBooks_Offline_App.html" || start chrome --app="file:///%~dp0FastBooks_Offline_App.html" || start "" "%~dp0FastBooks_Offline_App.html"
`;
  zip.file("Run_FastBooks_Windows.bat", runWindowsBat);

  // 4. macOS Executable Command Launcher
  const macCommand = `#!/bin/bash
# =========================================================================
# Fast-Books PRO - macOS Desktop Application Installer
# Proprietor: ${ownerName} - ${businessName}
# =========================================================================

DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
HTML_FILE="$DIR/FastBooks_Offline_App.html"
DESKTOP_LAUNCHER="$HOME/Desktop/Fast-Books.command"

echo "========================================================================"
echo "  Setting up Fast-Books Offline Desktop for macOS (${ownerName})"
echo "========================================================================"
echo ""

cat << EOF > "$DESKTOP_LAUNCHER"
#!/bin/bash
open -a "Google Chrome" --args --app="file://$HTML_FILE" || open -a "Safari" "file://$HTML_FILE" || open "file://$HTML_FILE"
EOF

chmod +x "$DESKTOP_LAUNCHER"
chmod +x "$DIR/Install_macOS.command" 2>/dev/null || true

echo "[SUCCESS] Created Desktop Launcher: $DESKTOP_LAUNCHER"
echo "Launching Fast-Books Offline App now..."
open -a "Google Chrome" --args --app="file://$HTML_FILE" || open "file://$HTML_FILE"
`;
  zip.file("Install_macOS.command", macCommand);

  // 5. Linux .desktop Entry
  const linuxDesktop = `[Desktop Entry]
Version=1.0
Type=Application
Name=Fast-Books Desktop Offline
Comment=South African Bookkeeping & Tax Invoicing for ${ownerName}
Exec=xdg-open "FastBooks_Offline_App.html"
Icon=accessories-calculator
Terminal=false
Categories=Office;Finance;Accounting;
StartupNotify=true
`;
  zip.file("FastBooks.desktop", linuxDesktop);

  // 6. Complete Database Backup JSON
  const jsonBackup = JSON.stringify(data, null, 2);
  zip.file("FastBooks_Database_Backup.json", jsonBackup);

  // 7. Clear Readme Guide
  const readme = `========================================================================
FAST-BOOKS PRO - OFFLINE DESKTOP INSTALLATION SUITE
========================================================================
Proprietor: ${ownerName}
Business:   ${businessName}
Generated:  ${new Date().toLocaleString()}

WHAT IS INCLUDED IN THIS PACKAGE:
------------------------------------------------------------------------
1. FastBooks_Offline_App.html
   A 100% standalone, self-contained single-file desktop application.
   It contains your complete live bookkeeping records (Invoices, Quotes,
   Clients, Bank Transactions, Expenses, and SARS 15% VAT).
   Double-click this file to open and run immediately in any web browser
   (Chrome, Edge, Safari, Firefox) with ZERO internet connection required.

2. Install_Windows.bat
   Double-click this batch script on Windows 10/11 to automatically create
   a "Fast-Books Offline Desktop" shortcut on your Desktop and open it
   in a standalone window.

3. Run_FastBooks_Windows.bat
   Quick launcher to open Fast-Books immediately in app-window mode.

4. Install_macOS.command
   Double-click on Mac to create an executable launcher on your macOS Desktop.

5. FastBooks.desktop
   Desktop shortcut configuration for Linux (Ubuntu, Debian, Fedora).

6. FastBooks_Database_Backup.json
   Portable JSON archive of all financial records for safe archiving.

HOW TO INSTALL:
------------------------------------------------------------------------
WINDOWS:
1. Extract all files from this ZIP folder to your preferred folder
   (e.g., C:\\FastBooks or Documents\\FastBooks).
2. Double-click "Install_Windows.bat".
3. A shortcut will appear on your Desktop. Double-click it anytime!

MAC:
1. Extract all files to your Applications or Documents folder.
2. Double-click "Install_macOS.command".

OFFLINE USAGE:
------------------------------------------------------------------------
- Zero internet or server connection needed.
- All new records, invoices, and edits are stored locally in your browser's
  local storage database.
- You can export new JSON backups and CSV spreadsheets at any time.

Support & Inquiries: Fast-Books South Africa
========================================================================
`;
  zip.file("README_OFFLINE_INSTALLATION.txt", readme);

  // Generate ZIP
  return await zip.generateAsync({ type: "blob" });
}
