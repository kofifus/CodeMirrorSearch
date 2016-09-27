function SearchBox()  {
	"use strict";
	let self, parent, btnState;
	let sboxElem, scombo, rcombo, workBtnsArr, optBtnsArr
	let changeFunc, optchangeFunc, keydownFunc, oninputFunc, blurFunc; // events

	function getElem(id) { 
		return sboxElem.querySelector('[data-id='+id+']'); 
	}

	// toggle replace combo
	function toggleReplace(t=undefined) {
		if (t===undefined) t=(btnRnext.style.display==='none');
		rcombo.toggle(t)
		getElem('replaceNext').style.display=getElem('replacePrev').style.display=getElem('replaceAll').style.display=(t ? 'inline' : 'none');
	}

	function replaceVisible() {
		return getElem('replaceNext').style.display!=='none';
	}

	// return { btn, id } - o is either btn elem or btn id
	function optElem(o) {
		let btn;
		if (o instanceof Element && o.dataset && o.dataset.id) { // o is btn elem
			btn=o;
		} else if ( typeof o==='string') { // o is btn id
			optBtnsArr.forEach(b => { if (b.dataset.id==o) btn=b; });
		}
		return { btn, id: btn ? btn.dataset.id : undefined };
	}

	// return true iff optBtn is depressed, o is either btn elem or btn id
	function optState(o) {
		let { btn, id }=optElem(o);
		return btn ? btn.style.borderStyle==='inset' : false;
	}

	// toggle optBtn
	function toggleOpt(o, t=undefined) {
		let { btn, id }=optElem(o);
		if (!btn) return null;
		if (t===undefined) t=!optState(btn); // toggle
		t=!!t;

		btn.style.borderStyle = (t ? 'inset' : 'outset');
		btnState[id]=t;
		return t;
	}

	// toggle optBtn
	function disableOpt(o, t=undefined) {
		let { btn, id }=optElem(o);
		if (!btn) return null;
		if (t===undefined) t=!btn.disabled; // toggle
		t=!!t;

		btn.disabled=t;
		return t;
	}

	// toggle the option panel
	function toggleOptPanel(t=undefined) {
		const upTriangle=String.fromCharCode(0x25b2), downTriangle=String.fromCharCode(0x25bc);
		let panel=sboxElem.getElementsByClassName('cmsb_optBtnsDiv')[0];
		if (t===undefined) t=!(panel.style.display==='inline');
		getElem('optToggler').innerHTML=(t ? upTriangle : downTriangle);
		panel.style.display=(t ? 'inline' : 'none');
	}

	function position(andShow) {
		if (parseFloat(sboxElem.style.top)<0 && !andShow) return; // hidden
		// position sbox on top right of parent
		let pRect=parent.getBoundingClientRect();
		let sRect = sboxElem.getBoundingClientRect();
		sboxElem.style.top=(pRect.top+2)+'px';
		sboxElem.style.left=(pRect.right-sRect.width-9)+'px';
	}

	function show(query=undefined, withReplace=false) {
		if (query!==undefined) scombo.value=query;
		toggleReplace(withReplace);
		position(true);
		select(true);
		scombo.focus();
	}

	function hide()  {
		sboxElem.style.top=sboxElem.style.left='-10000px'; 
	}

	function focus() { 
		scombo.focus(); 
	}

	// set input text color red for 500ms
	function notFound() { 
		scombo.focus();
		let scomboElem=getElem('scombo');
		scomboElem.style.borderColor='red';
		scombo.getInputElement().style.color='red';

		setTimeout( () => { 
			scomboElem.style.borderColor='black';
			scombo.getInputElement().style.color=''; 
		}, 500);
	}

	function select(b=true) {
		scombo.select(b);
		rcombo.select(b);
	}

	function overlaps(rect) {
		let srect=sboxElem.getBoundingClientRect();
		return !(rect.right < srect.left ||  rect.left > srect.right || rect.bottom < srect.top || rect.top > srect.bottom);
	}

	function hookEvents() {
		scombo.onchange = rcombo.onchange = (e, combo) => { 
			if (changeFunc) changeFunc(combo===scombo ? 'next' : 'replaceNext'); 
		};

		scombo.onkeydown = rcombo.onkeydown = (e, combo) => {
			let res;
			if (keydownFunc) res=keydownFunc(e, combo===scombo);
			if (res===false || e.defaultPrevented) return;

			let ctrlf=!e.shiftKey && e.ctrlKey && !e.altKey && e.key==='f', ctrlh=!e.shiftKey && e.ctrlKey && !e.altKey && e.key==='h', tab=!e.shiftKey && !e.ctrlKey && !e.altKey && e.key==='Tab';

			if (ctrlf || ctrlh || tab) {
				e.preventDefault(); 
				if (ctrlf && replaceVisible()) {
					toggleReplace(false);
					scombo.focus();
				} else if (ctrlh && !replaceVisible()) {
					toggleReplace(true);
					if (scombo.value) rcombo.focus(); else scombo.focus();
				} else if (tab) { 
					if (combo===scombo) {
						if (!replaceVisible()) getElem('next').focus(); else rcombo.focus();
					} else {
						getElem('next').focus();
					}
				}
			}
		};

		scombo.oninput = rcombo.onkeydown = (e, combo) => {
			if (oninputFunc) oninputFunc(e, combo===scombo);
		};

		// hook onclick for next/prev/repl/replPrev/all
		let workBtnClick = e => {
			e.stopPropagation();
			scombo.focus();
			if (changeFunc) {
				let id=e.currentTarget.dataset.id;
				changeFunc(id);
			}
		};
		let workBtnKeyDown = e => {
			let tab=!e.shiftKey && !e.ctrlKey && !e.altKey && e.key==='Tab', esc=!e.shiftKey && !e.ctrlKey && !e.altKey && e.key==='Escape';
			if (tab) {
				e.stopPropagation(); e.preventDefault();
				let lastBtn=getElem(replaceVisible() ? 'replaceAll' : 'prev'), i=workBtnsArr.indexOf(e.currentTarget);
				if (e.currentTarget===lastBtn) scombo.focus(); else workBtnsArr[i+1].focus();
			} else if (esc) {
				hide();
			}
		};
		workBtnsArr.forEach( btn => { 
			btn.onclick=workBtnClick; 
			btn.onkeydown=workBtnKeyDown;
		});

		// hook onclick for the option buttons
		let optBtnClick = e => {
			e.stopPropagation();
			let btn=e.currentTarget, id=btn.dataset.id;

			let t=toggleOpt(btn);
			if (id==='regexp') disableOpt('wholeWord', t);

			scombo.focus();
			if (optchangeFunc) optchangeFunc(id);
		};
		optBtnsArr.forEach(btn => { btn.onclick=optBtnClick; });

		getElem('optToggler').onclick = e => { 
			toggleOptPanel(); 
		}

		sboxElem.onclick = e => { 
			e.stopPropagation(); 
			scombo.focus(); 
		}
		
		scombo.onblur = rcombo.onblur = e => { 
			if (blurFunc) {
				let relatedTarget=e.relatedTarget ? e.relatedTarget : document.activeElement;
				if (!sboxElem.contains(e.relatedTarget)) blurFunc(e);
			}; 
		}
	}

	function ctor(parent_, btnState_) {
		self=this; parent=parent_; btnState=btnState_;

		let outerHtml = `
				<div class="CMsearchBox" style="top:-10000px;left:-10000px;">
					<div data-id="scombo" class="fbSearchInputs"></div>
					<div data-id="rcombo" class="fbSearchInputs" style="margin-top:7px;"></div>
					<div style="min-height: 9px"></div>
					<div style="float:left; ">
						<button data-id="next" class="fbSearchBigBtns" title="Find Next (F3)">&rarr;</button>
						<button data-id="prev" class="fbSearchBigBtns" title="Find Previous (F4)">&larr;</button>
						<button data-id="replaceNext" class="fbSearchBigBtns" title="Replace Next">&#x21D2;</button>
						<button data-id="replacePrev" class="fbSearchBigBtns" title="Replace Previous">&#x21D0;</button>
						<button data-id="replaceAll" class="fbSearchBigBtns" title="Replace All">&#x21D4;</button>
					</div>
					<div style="float:right">
						<button data-id="optToggler" class="fbSearchSmallBtns" title="settings" style="margin-top:4px;margin-right:1px">&#9660;</button> 
					</div>
					<div style="clear:both"></div>
					<div class="cmsb_optBtnsDiv" style="float:right;margin-top:7px;margin-right:1px;display:none;">
						<button data-id="caseSensitive" class="fbSearchSmallBtns" title="Case Sensitive">C</button>
						<button data-id="wholeWord" class="fbSearchSmallBtns" title="Whole Word">W</button>
						<button data-id="regexp" class="fbSearchSmallBtns" title="Regular Expression">R</button>
						<button data-id="inSelection" class="fbSearchSmallBtns" title="In Selection">S</button>
						<button data-id="wrapAround" class="fbSearchSmallBtns" title="Wrap Around">A</button>
						<button data-id="highlight" class="fbSearchSmallBtns" title="Highlight">H</button>
						<button data-id="persistent" class="fbSearchSmallBtns" title="Persistent Dialog">P</button>
					</div>
				</div>`;

		// set outer html, append and reassign element 
		sboxElem=document.createElement('div');
		parent.appendChild(sboxElem);
		let indexInParent=[].slice.call(parent.children).indexOf(sboxElem);
		sboxElem.outerHTML=outerHtml;
		sboxElem=parent.children[indexInParent];

		let parentBG=window.getComputedStyle(parent, null).getPropertyValue('background-color');
		parentBG=parentBG.replace(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/, 'rgba($1,$2,$2,0.8)'); // add opacity
		sboxElem.style.backgroundColor=parentBG;

		scombo=Combo.New(getElem('scombo'));
		rcombo=Combo.New(getElem('rcombo'));

		let btnElems=sboxElem.getElementsByTagName('button');
		workBtnsArr=[ getElem('next'), getElem('prev'), getElem('replaceNext'), getElem('replacePrev'), getElem('replaceAll') ]
		optBtnsArr=[ getElem('caseSensitive'), getElem('wholeWord'), getElem('regexp'), getElem('inSelection'), getElem('wrapAround'), getElem('highlight'), getElem('persistent') ];

		Object.keys(btnState).forEach(k => toggleOpt(k, btnState[k])); // init options toggled state

		hookEvents();
	}

	return {
		ctor,
		show,
		hide,
		position, // reposition the box if it is visible
		focus,
		notFound,
		overlaps,

		get value() { return [ scombo.value, rcombo.value ]; },

		// events
		set onchange(f) { changeFunc=f;  }, // call f(q, op) -> (query,  'next'/'prev'/'replaceNext'/'replacePrev'/replaceAll') 
		set onoptchange(f) { optchangeFunc=f; }, // call f(id, btnState) when an option button is clicked
		set onkeydown(f) { keydownFunc=f;  }, // call f(e, isSearchCombo) when keydown in one of the combos
		set oninput(f) { oninputFunc=f; }, // f(e, isSearchCombo) when oninput in the search combo
		set onblur(f) { blurFunc=f; }, // f()
	};
}


function CMsearch() {
	"use strict";
	let cm, btnState, sbox, qRegExp, hRegExp, matchMark;

	function cmposBefore(p1 ,p2) {
		return p1.line<p2.line || (p1.line===p2.line && p1.ch < p2.ch);
	}
	function cmposAfter(p1 ,p2) {
		return p1.line>p2.line || (p1.line===p2.line && p1.ch > p2.ch);
	}
	function cmposEq(p1 ,p2) {
		return p1.line===p2.line && p1.ch===p2.ch;
	}
	function cmposFirst() {
		return { line:0, ch:0};
	}
	function cmposLast(cm) {
		let line=cm.lineCount()-1, ch=cm.getLine(line).trim().length;
		while(line>0 &&ch===0) {
			line--;
			ch=cm.getLine(line).trim().length;
		}
		return { line, ch};
	}

	// If newState is provided add/remove theClass accordingly, otherwise toggle theClass
	function toggleClass(elem, theClass, newState) {
		let matchRegExp = new RegExp('(?:^|\\s)' + theClass + '(?!\\S)', 'g');
		let add = (arguments.length > 2 ? newState : (elem.className.match(matchRegExp) === null));

		elem.className = elem.className.replace(matchRegExp, ''); // clear all
		if (add) elem.className += ' ' + theClass;
	}

	// toggle class on all cursors
	function cmToggleCursorsClass(cm, theClass, newState) {
		toggleClass(cm.getWrapperElement().getElementsByClassName('CodeMirror-cursors')[0], theClass, newState); 
	}

	// toggle class on all individual cursors
	function cmToggleCursorsInnerClass(cm, theClass, newState) {
		let cursors=Array.from(cm.getWrapperElement().getElementsByClassName('CodeMirror-cursor'));
		cursors.forEach(c => { toggleClass(c, theClass, newState); });
	}

	// http://stackoverflow.com/questions/874709/converting-user-input-string-to-regular-expression
	function regExpFromString(q) { 
		let flags = q.replace(/.*\/([gimuy]*)$/, '$1');
		if (flags===q) flags='';
		let pattern=(flags ? q.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1') : q);
		flags.replace('g', ''); // remove g flag
		try { return new RegExp(pattern, flags); } catch(e) { return null; }
	}

	function setQuery(q) {
		qRegExp=hRegExp=null;
		if (!q) q=sbox.value[0]; if (!q) return;

		if (btnState.regexp) {
			qRegExp=regExpFromString(q);
		} else {
			q=q.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
			if (q && btnState.wholeWord) q='\\b'+q+'\\b';
			qRegExp=new RegExp(q);
		}
		if (qRegExp) qRegExp=new RegExp(qRegExp.source, btnState.caseSensitive ? '' : 'i');
		hRegExp=qRegExp && q.length>1 ? new RegExp(qRegExp.source, qRegExp.flags+'g') : null;

		doHighlight();
	}

	function doHighlight() {
		if (hRegExp) hRegExp.lastIndex=0;
		cm.setOption('maxHighlightLength', (--cm.options.maxHighlightLength) +1); // hack to rerun the overlay
	}

	function hideHighlight() {
		if (hRegExp) {
			hRegExp=null; 
			doHighlight(); // remove overlay
		}
	}

	function getSearchArea() {
		if (!btnState.inSelection) return { from: cmposFirst(), to: cmposLast(cm) };

		let selections=cm.listSelections(), nullSel={ from: { line:0, ch:0}, to: { line:0, ch:0} };
		if (selections.length===0) return nullSel;

		let selection={ from: selections[0].anchor, to: selections[0].head };
		if (cmposAfter(selection.from, selection.to)) selection={ from: selection.to, to: selection.from };

		// verify our selection is not the matchMark
		let markfind=(matchMark && matchMark.find() ? matchMark.find() : null);
		if (selections.length===1 && markfind && cmposEq(markfind.from, selection.from) && cmposEq(markfind.to, selection.to)) return nullSel;

		return selection;
	}

	function findx(fw=true) {
		if (!qRegExp) return;

		let sa=getSearchArea();

		let pos, prevMatch=(matchMark ? matchMark.find() : null);

		if (btnState.inSelection) {
			pos=(prevMatch ? (fw ? prevMatch.to : prevMatch.from) : sa.from);
		} else {
			pos=cm.getCursor();
			if (prevMatch && !fw && cmposEq(pos, prevMatch.to)) pos=prevMatch.from; 
		}

		let cursor = cm.getSearchCursor(qRegExp, pos);
		let found=cursor.find(!fw);
		if (found && btnState.inSelection && (cmposBefore(cursor.from(), sa.from) ||cmposAfter(cursor.to(), sa.to))) found=null;
		if (!found  && btnState.wrapAround) {
			pos=fw ? sa.from : sa.to;
			cursor = cm.getSearchCursor(qRegExp, pos);
			found=cursor.find(!fw);
			if (found && btnState.inSelection && (cmposBefore(cursor.from(), sa.from) ||cmposAfter(cursor.to(), sa.to))) found=null;
		}

		if (!found) { 
			// blink the cursor as thick red once
			cmToggleCursorsInnerClass(cm, 'redCursor', true);
			setTimeout(() => { cmToggleCursorsInnerClass(cm, 'redCursor', false); }, 500);

			sbox.notFound();
			return false;
		}

		if (!btnState.persistent) {
			sbox.hide();
			cm.focus();
		}

		cm.scrollIntoView( {from: cursor.from(), to: cursor.to() }, 20);
		
		if (!btnState.inSelection) cm.setSelection(cursor.from(), cursor.to());
		if (!btnState.inSelection && !btnState.persistent) cm.focus();

		if (matchMark) { matchMark.clear(); matchMark=null; }
		matchMark=cm.markText(cursor.from(), cursor.to(), { className: 'cm-searchMatch' }); 

		// scroll if overlapped
		let melem=cm.getWrapperElement().getElementsByClassName('cm-searchMatch')[0];
		while(sbox.overlaps(melem.getBoundingClientRect())) { // scroll until sbox not covering match
			let top=cm.getScrollInfo().top;
			if (top<25) break; else cm.scrollTo(null, top-25); 
		};
		return true;
	}

	function replace(qr, fw=true) {
		if (!qRegExp) return;
		if (!matchMark) return find(fw);

		let pos=matchMark.find();
		
		if (btnState.regexp) {
			let match = cm.getRange(pos.from, pos.to).match(qRegExp);
			qr=qr.replace(/\$(\d)/g, function(_, i) { return match[i]; });
		} 
		cm.replaceRange(qr, pos.from, pos.to);
		matchMark.clear(); matchMark=null; 
		matchMark=cm.markText(pos.from, pos.to, { className: 'cm-searchMatch' }); 
				
		find(fw);
	}

	function replaceAll(qr) {
		let sa=getSearchArea();

		let replaced=0;
		cm.operation(function() {
			for (let cursor = cm.getSearchCursor(qRegExp, sa.from); cursor.findNext();) {
				if (btnState.inSelection && cmposAfter(cursor.to(), sa.to)) break;

				if (btnState.regexp) {
					let match = cm.getRange(cursor.from(), cursor.to()).match(qRegExp);
					cursor.replace(qr.replace(/\$(\d)/g, function(_, i) { return match[i]; }));
				} else {
					cursor.replace(qr);
				}
				replaced++;
			}
		});

		if (replaced===0) {
			sbox.notFound();
		} else if (!btnState.persistent) {
			sbox.hide();
			cm.focus();
		}

		return replaced;
	}

	function show(withReplace=false) {
		let query;
		if (btnState.inSelection) {
			query=sbox.value[0];
		} else {
			let selection=cm.getSelection();
			if (selection.length>1 && selection.length<100) query=selection;
		}
		setQuery(query);

		sbox.show(query, withReplace);
	}

	function hide() {
		sbox.hide();
	}

	function hookEvents() {

		sbox.onchange = (op) => {
			let [ q, qr ]=sbox.value;
			setQuery(q);

			if (op==='next') find();
			else if (op==='prev') find(false);
			else if (op==='replaceNext') replace(qr);
			else if (op==='replacePrev') replace(qr, false);
			else if (op==='replaceAll') replaceAll(qr);
		};

		sbox.onoptchange = (id)  => {
			let [ q, qr ]=sbox.value;
			setQuery(q);
			if (matchMark) { matchMark.clear(); matchMark=null; }
		};

		sbox.onkeydown = (e, inFind) => {
			if (e.key==='Escape') {
				sbox.hide();
				hideHighlight();
				cm.focus();
			}
		};

		sbox.oninput = (e, inFind) => {
			if (inFind) setQuery(sbox.value[0]); 
		};

		sbox.onblur = () => {
			if (!btnState.persistent) sbox.hide();
		};

		cm.on('beforeSelectionChange', (cm, obj) => {
			if (obj.origin && btnState.inSelection && matchMark) { matchMark.clear(); matchMark=null; }
		});

		cm.on('change', (cm, changeObj) => {	
			if (changeObj.origin) {
				if (!btnState.persistent) hideHighlight();
				if (matchMark) { matchMark.clear(); matchMark=null; }
			}
		});

		cm.on('refresh', cm => {
			sbox.position();
		});

		// keep an unblinking cursor on when blurring
		cm.on('blur', cm => { cmToggleCursorsClass(cm, 'CodeMirror-cursorsVisible', true); });
		cm.on('focus', cm => {	cmToggleCursorsClass(cm, 'CodeMirror-cursorsVisible', false); });
	}

	function ctor(cm_) {
		cm=cm_;

		btnState={
			caseSensitive: false, 
			wholeWord: false,
			regexp: false,
			wrapAround: false,
			highlight: true,
			inSelection: false,
			persistent: true,
		};

		sbox=SearchBox.New(cm.getWrapperElement(), btnState);

		cm.addOverlay({
			token: stream => {
				if (!hRegExp || !btnState.highlight) {
					stream.skipToEnd();
					return;
				}

				hRegExp.lastIndex = stream.pos;
				let match = hRegExp.exec(stream.string);
				if (match && match.index == stream.pos) {
					stream.pos += match[0].length || 1;
					return btnState.inSelection ? 'inSelectionSearchHighlight' : 'searchHighlight';
				} else if (match) {
					stream.pos = match.index;
				} else {
					stream.skipToEnd();
				}
			}
		});

		// add the key binding, doing a context switchto escape the keypress handler
		cm.addKeyMap({
			'Ctrl-F': cm => show(),
			'Ctrl-G': cm => find(),
			'F3': cm => find(),
			'Shift-Ctrl-G': cm => find(false),
			'Shift-F3': cm => find(false),
			'Shift-Ctrl-F': cm => show(true),
			'Ctrl-H': cm => show(true),
			'Shift-Ctrl-R': cm => ReplaceAll(),
			'Esc': cm => { hide();  hideHighlight(); }
		});

		cm.focus(); // Combo ctors change the focus
		hookEvents();
	}

	// public Interface
	return {
		ctor, // (cm)
		show, // (replace=false) => show sbox with/without replace ui
		hide, // () => hides sbox
		find, //  (fw=true) => search fw or bw
	}
}


function initCMsearch(cm) {
	// create an instance of SearchAndReplace 
	// no need to store it - held by the key bindings
	CMsearch.New(cm);
}
