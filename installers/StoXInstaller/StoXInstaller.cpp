// LaunchSync.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>

#include <objbase.h>
#include "resource.h"
#include <windows.h>
#include <string>

#pragma comment(linker, "/SUBSYSTEM:windows /ENTRY:mainCRTStartup")
using namespace std;

/*
*	Execution container for MSI installer.
	StoXInstaller.exe unpacks a msi installer from resource and elevates the shell execution UAC automatically.
*/

const string STOX_MSI_FILE = "StoX.msi";

int main(int argc, char* argv[])
{
	//string msi = "IDR_STOX";
	HINSTANCE hInstance = GetModuleHandle(NULL);
	HANDLE hFile = INVALID_HANDLE_VALUE;
	HRSRC hrsrc = FindResourceA(hInstance, MAKEINTRESOURCEA(IDR_STOX), MAKEINTRESOURCEA(10)/*RT_RCDATA*/);
	if (hrsrc == 0) {
		return -1;
	}
	HGLOBAL exeRes = LoadResource(hInstance, hrsrc);
	if (exeRes == 0) {
		return -1;
	}
	DWORD size = SizeofResource(hInstance, hrsrc);

	string tempPathBuffer(MAX_PATH, '\0');
	GetTempPathA(MAX_PATH, &tempPathBuffer[0]);

	string msiFileName = string(&tempPathBuffer[0]) + STOX_MSI_FILE;

	HANDLE hfile;
	hFile = CreateFileA(&msiFileName[0], GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);

	LPVOID exePtr = LockResource(exeRes);
	DWORD exeWritten = 0;
	BOOL writeResult = WriteFile(hFile, exePtr, size, &exeWritten, NULL);

	BOOL closed = CloseHandle(hFile);

	SHELLEXECUTEINFOA ShExecInfo = { 0 };
	ShExecInfo.cbSize = sizeof(SHELLEXECUTEINFOA);
	ShExecInfo.fMask = SEE_MASK_NOCLOSEPROCESS | SEE_MASK_NOASYNC;
	ShExecInfo.hwnd = NULL;
	ShExecInfo.lpVerb = "runas";
	ShExecInfo.lpFile = "msiexec";
	string msicmd = "/i \"" + msiFileName + "\"";
	ShExecInfo.lpParameters = &msicmd[0];
	ShExecInfo.lpDirectory = NULL;
	ShExecInfo.nShow = SW_SHOW;
	ShExecInfo.hInstApp = NULL;
	ShellExecuteExA(&ShExecInfo);
	if (ShExecInfo.hProcess != 0) {
		WaitForSingleObject(ShExecInfo.hProcess, INFINITE);
	}
	DeleteFileA(&msiFileName[0]);
	return 0;
}