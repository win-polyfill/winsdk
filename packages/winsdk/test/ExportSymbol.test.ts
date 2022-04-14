import { parseArchiveMember, newExportSymbolResult } from '@esutils/winsdk';

describe('exec in typescript', () => {
  it('parse single archive member with name type `ordinal`', async () => {
    const archiveMember = [
      'Archive member name at 814: ACLUI.dll/      ',
      '3D507A92 time/date Wed Aug  7 09:40:34 2002',
      '         uid',
      '         gid',
      '       0 mode',
      '      38 size',
      'correct header end',
      '',
      '  Version      : 0',
      '  Machine      : 14C (x86)',
      '  TimeDateStamp: 3D507A92 Wed Aug  7 09:40:34 2002',
      '  SizeOfData   : 00000024',
      '  DLL name     : ACLUI.dll',
      '  Symbol name  : _IID_ISecurityInformation',
      '  Type         : code',
      '  Name type    : ordinal',
      '  Ordinal      : 16',
      '',
    ];
    const result = newExportSymbolResult();
    parseArchiveMember(result, archiveMember);
    expect(result.libSymbols.length).toBeGreaterThan(0);
  });

  it('parse single archive member with name type `name`', async () => {
    const archiveMember = [
      'Archive member name at EA0: STI.dll/        ',
      '3D5073C7 time/date Wed Aug  7 09:11:35 2002',
      '         uid',
      '         gid',
      '       0 mode',
      '      2F size',
      'correct header end',
      '',
      '  Version      : 0',
      '  Machine      : 14C (x86)',
      '  TimeDateStamp: 3D5073C7 Wed Aug  7 09:11:35 2002',
      '  SizeOfData   : 0000001B',
      '  DLL name     : STI.dll',
      '  Symbol name  : ??0BUFFER@@QAE@I@Z (public: __thiscall BUFFER::BUFFER(unsigned int))',
      '  Type         : code',
      '  Name type    : name',
      '  Hint         : 0',
      '  Name         : ??0BUFFER@@QAE@I@Z',
      '',
    ];
    const result = newExportSymbolResult();
    parseArchiveMember(result, archiveMember);
    expect(result.libSymbols.length).toBeGreaterThan(0);
  });

  it('parse single archive member with name type `no prefix`', async () => {
    const archiveMember = [
      'Archive member name at 1372: AUTHZ.dll/      ',
      '3D506FA6 time/date Wed Aug  7 08:53:58 2002',
      '         uid',
      '         gid',
      '       0 mode',
      '      45 size',
      'correct header end',
      '',
      '  Version      : 0',
      '  Machine      : 14C (x86)',
      '  TimeDateStamp: 3D506FA6 Wed Aug  7 08:53:58 2002',
      '  SizeOfData   : 00000031',
      '  DLL name     : AUTHZ.dll',
      '  Symbol name  : _AuthzInitializeObjectAccessAuditEvent',
      '  Type         : code',
      '  Name type    : no prefix',
      '  Hint         : 11',
      '  Name         : AuthzInitializeObjectAccessAuditEvent',
      '',
    ];
    const result = newExportSymbolResult();
    parseArchiveMember(result, archiveMember);
    expect(result.libSymbols.length).toBeGreaterThan(0);
  });

  it('parse single archive member with name type `undecorate`', async () => {
    const archiveMember = [
      'Archive member name at 3840: COMCTL32.dll/   ',
      '3D37BB11 time/date Fri Jul 19 15:09:05 2002',
      '         uid',
      '         gid',
      '       0 mode',
      '      3C size',
      'correct header end',
      '',
      '  Version      : 0',
      '  Machine      : 14C (x86)',
      '  TimeDateStamp: 3D37BB11 Fri Jul 19 15:09:05 2002',
      '  SizeOfData   : 00000028',
      '  DLL name     : COMCTL32.dll',
      '  Symbol name  : _CreatePropertySheetPage@4',
      '  Type         : code',
      '  Name type    : undecorate',
      '  Hint         : 3',
      '  Name         : CreatePropertySheetPage',
      '',
    ];
    const result = newExportSymbolResult();
    parseArchiveMember(result, archiveMember);
    expect(result.libSymbols.length).toBeGreaterThan(0);
  });
});
