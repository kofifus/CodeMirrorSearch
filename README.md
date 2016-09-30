## CodeMirror Search ##

Enhanced CodeMirror search and replace
<br/><br/>
<h4>Usage</h4>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/codemirror.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/mode/overlay.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/scroll/simplescrollbars.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/search/searchcursor.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/selection/mark-selection.js"></script>
  	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/codemirror.css">
	<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.19.0/addon/scroll/simplescrollbars.css">
    
    <script src="https://rawgit.com/kofifus/New/master/new.min.js"></script>
    <script src="https://rawgit.com/kofifus/Combo/master/combo.min.js"></script>    
    <script src="https://rawgit.com/kofifus/CodeMirrorSearch/master/cmsearch.min.js"></script>
    <link rel="stylesheet" type="text/css" href="https://rawgit.com/kofifus/CodeMirrorSearch/master/cmsearch.css">
        
    <style>
      .CodeMirror { border: 1px solid ; height: 400px; width: 400px; margin-left:30px; }
    </style>
        
    <textarea id="ta"></textarea>
    
    <script>
      let ta=document.getElementById('ta');
      let cm = CodeMirror.fromTextArea(ta, { lineWrapping:true, scrollbarStyle:'simple', showCursorWhenSelecting:true, styleSelectedText:true });
      cm.setValue('some text');
      initCMsearch(cm);      
    </script>
<br/>
<h4>Key Bindings</h4>

Ctrl-F  =>  show find widget<br/>
Ctrl-G / F3 => find next<br/>
Shift-Ctrl-G / Shift-F3 => find prev<br/>
Shift-Ctrl-F / Ctrl-H => show replace widget<br/>
ctrl+F3 / shift+ctrl+H => replace next<br/>
shift+ctrl+F3 => replace prev<br/>
Shift-Ctrl-R => replace all<br/>
Esc => hide widget & highlights<br/>
<br/>
<h4>Features</h4>

 - combo boxes search and replace
 - find next / find prev / replace next / replace prev / replace all
 - case sensitive / whole word / regular expression / in selection / 
    wrap around / highlight / persistent dialog
    
<br/>
<h4>Demo</h4>
http://plnkr.co/edit/LEEZf2Vt9U6PASRGpsrt?p=preview
