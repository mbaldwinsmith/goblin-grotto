import pathlib, sys
ids, message = sys.argv[1:]
p = pathlib.Path('PLAN.md')
s = p.read_text()
for id in ids.split(','):
    s = s.replace('- [ ] **'+id+' —', '- [x] **'+id+' —')
p.write_text(s)
p = pathlib.Path('CHANGELOG.md')
s = p.read_text().replace('### Added\n', '### Added\n\n- '+message+' ('+ids+').\n', 1)
p.write_text(s)
