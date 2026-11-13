'use strict';
// Browser-only document exports, with no external libraries or server requests.
const exportSections = (a,r) => [
  {heading:'Student information', paragraphs:['Name: '+(r.studentName||'Not provided'),'Assignment: '+a.assignmentTitle,'Learning objective: '+(a.objective||'')]},
  {heading:'Original clinical case', paragraphs:[a.caseText]},
  {heading:'1. Commit', paragraphs:[a.commitPrompt||defaults.commit,'Student response:',r.answers[0]||'']},
  {heading:'New clinical information', paragraphs:[a.complication]},
  {heading:'2. Complicate', paragraphs:[a.complicatePrompt||defaults.complicate,'Student response:',r.answers[1]||'']},
  {heading:'3. Calibrate', paragraphs:[a.calibratePrompt||defaults.calibrate,'Student response:',r.answers[2]||'']},
  {heading:'Submission instructions', paragraphs:[a.submission||'Submit to your instructor.']},
  {heading:'Activity note', paragraphs:['This document records responses submitted through a structured learning activity. It does not verify independent authorship or clinical competence.']}
];
const xmlEscape = s => String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function wordXml(sections){
  const para=(text,bold=false)=>'<w:p><w:pPr><w:spacing w:after="150"/></w:pPr><w:r>'+(bold?'<w:rPr><w:b/><w:color w:val="174D54"/><w:sz w:val="26"/></w:rPr>':'<w:rPr><w:sz w:val="22"/></w:rPr>')+'<w:t xml:space="preserve">'+xmlEscape(text)+'</w:t></w:r></w:p>';
  let body=para('VCR | Completed Clinical Reasoning Assignment',true);
  for(const section of sections){body+=para(section.heading,true);for(const text of section.paragraphs)for(const line of String(text||'').split('\n'))body+=para(line||' ')}
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body></w:document>';
}
const utf8=s=>new TextEncoder().encode(s);
const crcTable=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t.push(c>>>0)}return t})();
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function zipStore(entries){const parts=[],central=[];let offset=0;const u16=(d,o,v)=>d.setUint16(o,v,true),u32=(d,o,v)=>d.setUint32(o,v,true);
 for(const [name,content] of entries){const n=utf8(name),b=utf8(content),crc=crc32(b);const local=new Uint8Array(30+n.length),lv=new DataView(local.buffer);u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0x800);u32(lv,14,crc);u32(lv,18,b.length);u32(lv,22,b.length);u16(lv,26,n.length);local.set(n,30);parts.push(local,b);
 const cen=new Uint8Array(46+n.length),cv=new DataView(cen.buffer);u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x800);u32(cv,16,crc);u32(cv,20,b.length);u32(cv,24,b.length);u16(cv,28,n.length);u32(cv,42,offset);cen.set(n,46);central.push(cen);offset+=local.length+b.length}
 const centralLength=central.reduce((sum,b)=>sum+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);u32(v,0,0x06054b50);u16(v,8,entries.length);u16(v,10,entries.length);u32(v,12,centralLength);u32(v,16,offset);return new Blob([...parts,...central,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})}
function makeDocx(a,r){const sections=exportSections(a,r);return zipStore([
 ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
 ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
 ['word/document.xml',wordXml(sections)]
 ])}
function makePdf(a,r){const sections=exportSections(a,r),pageW=612,pageH=792,left=54,top=64,bottom=56,maxW=pageW-2*left;
 // Core PDF fonts support WinAnsi. Normalize unsupported glyphs rather than emitting broken characters.
 const normalize=s=>String(s||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\u2022/g,'*').replace(/\u2026/g,'...').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7e\n\t\xA0-\xFF]/g,'?');
 const pdfEsc=s=>normalize(s).replace(/[\\()]/g,'\\$&');
 const pages=[];let cmds=[],y=pageH-top;
 const startPage=()=>{if(cmds.length)pages.push(cmds.join('\n'));cmds=[];y=pageH-top};
 const draw=(line,size=10,bold=false,space=15)=>{if(y-space<bottom)startPage();cmds.push(`BT /${bold?'F2':'F1'} ${size} Tf 0.10 0.25 0.28 rg 1 0 0 1 ${left} ${y.toFixed(2)} Tm (${pdfEsc(line)}) Tj ET`);y-=space};
 const wrap=(text,size=10)=>{const charMax=Math.max(25,Math.floor(maxW/(size*.52)));for(const raw of normalize(text).split('\n')){if(!raw.trim()){draw(' ',size,false,12);continue}let line='';for(const word of raw.split(/\s+/)){if((line+' '+word).trim().length>charMax&&line){draw(line,size);line=''}if(word.length>charMax){if(line){draw(line,size);line=''}for(let i=0;i<word.length;i+=charMax)draw(word.slice(i,i+charMax),size);continue}line+=(line?' ':'')+word}if(line)draw(line,size)}};
 draw('VCR | COMPLETED CLINICAL REASONING ASSIGNMENT',15,true,30);
 for(const s of sections){if(y<bottom+80)startPage();draw(s.heading.toUpperCase(),12,true,21);for(const p of s.paragraphs){wrap(p);y-=8}y-=6}
 if(cmds.length)pages.push(cmds.join('\n'));
 const objects=['','<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
 const kids=[];for(const content of pages){const pageId=objects.length,kid=pageId+' 0 R';kids.push(kid);const streamId=pageId+1;objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`);objects.push(`<< /Length ${utf8(content).length} >>\nstream\n${content}\nendstream`)}
 objects[2]=`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`;
 let out='%PDF-1.4\n%VCR\n',offsets=[0];for(let i=1;i<objects.length;i++){offsets[i]=utf8(out).length;out+=`${i} 0 obj\n${objects[i]}\nendobj\n`};const xref=utf8(out).length;out+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;for(let i=1;i<objects.length;i++)out+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';out+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;return new Blob([out],{type:'application/pdf'})}
function downloadBlob(filename,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
