// Search widget
function SearchBox()  {
	"use strict";
	let self, parent, btnState;
	let sboxElem, scombo, rcombo, workBtnsArr, optBtnsArr
	let changeFunc, optchangeFunc, keydownFunc, oninputFunc, blurFunc; // events

	function getElem(id) { 
		return sboxElem.querySelector('[data-id='+id+']'); 
	}

	function replaceVisible() {
		return getElem('replaceNext').style.display!=='none';
	}

	// toggle replace combo
	function toggleReplace(t=undefined) {
		if (t===undefined) t=!replaceVisible();
		rcombo.toggle(t)
		getElem('replaceNext').style.display=getElem('replacePrev').style.display=getElem('replaceAll').style.display=(t ? 'inline' : 'none');
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

	// toggle optBtn, o is either btn elem or btn id
	function toggleOpt(o, t=undefined) {
		let { btn, id }=optElem(o);
		if (!btn) return null;
		if (t===undefined) t=!optState(btn); // toggle
		t=!!t;

		btn.style.borderStyle = (t ? 'inset' : 'outset');
		btnState[id]=t;
		return t;
	}

	// disable optBtn, o is either btn elem or btn id
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
		let panel=getElem('optBtnsDiv');
		if (t===undefined) t=!(panel.style.display==='inline');
		getElem('optToggler').innerHTML=(t ? upTriangle : downTriangle);
		panel.style.display=(t ? 'inline' : 'none');
		scombo.focus();
	}

	// return true iff sbox is visible
	function visible() {
		return parseFloat(sboxElem.style.top)>=0;
	}

	// position sbox on top right of parent if visible or optionally also if not
	function position(andShow=false) {
		if (!visible() && !andShow) return; // hidden
		let pRect=parent.getBoundingClientRect();
		let sRect = sboxElem.getBoundingClientRect();
		sboxElem.style.top=(pRect.top+2)+'px';
		sboxElem.style.left=(pRect.right-sRect.width-9)+'px';
	}

	// show sbox with query and optionally with replace combo and buttons
	function show(withReplace=false, query=undefined) {
		toggleReplace(withReplace);
		position(true);
		if (query!==undefined) scombo.value=query;
		select(true);
		scombo.focus();
	}

	// hide sbox
	function hide()  {
		sboxElem.style.top=sboxElem.style.left='-10000px'; 
	}

	// focus sbox
	function focus() { 
		scombo.focus(); 
	}

	// set scombo text & border color red for 500ms
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

	// select the text in the combos
	function select(b=true) {
		scombo.select(b);
		rcombo.select(b);
	}

	// determines if sbox rect overlaps rect
	function overlaps(rect) {
		let srect=sboxElem.getBoundingClientRect();
		return !(rect.right < srect.left ||  rect.left > srect.right || rect.bottom < srect.top || rect.top > srect.bottom);
	}

	function hookEvents() {
		// combo selection change (enter or select)
		scombo.onchange = rcombo.onchange = (e, combo) => { 
			if (changeFunc) changeFunc(combo===scombo ? 'next' : 'replaceNext'); 
		};

		// combos ctrl+f, ctrl+h, tab 
		scombo.onkeydown = rcombo.onkeydown = (e, combo) => {
			let res;
			if (keydownFunc) res=keydownFunc(e, combo===scombo);
			if (res===false || e.defaultPrevented) return;

			let plain=!e.shiftKey && !e.ctrlKey && !e.altKey, ctrl=!e.shiftKey && e.ctrlKey && !e.altKey, ctrlshift=e.shiftKey && e.ctrlKey && !e.altKey

			if (ctrl && e.key==='f' && replaceVisible()) {
				toggleReplace(false);
				scombo.focus();
			} else if (ctrl && e.key==='h' && !replaceVisible()) {
				toggleReplace(true);
				if (scombo.value) rcombo.focus(); else scombo.focus();
			} else if (plain && e.key==='Tab') { 
				if (combo===scombo &&replaceVisible()) rcombo.focus(); else getElem('next').focus();
			}

			// ignore some browser defauklt search keys
			if ((plain && ['F3', 'Tab'].indexOf(e.key)>-1) || (ctrl && ['f', 'h', 'g', 'F', 'H', 'G'].indexOf(e.key)>-1) || (ctrlshift && ['g', 'G'].indexOf(e.key)>-1)) e.preventDefault();
		};

		// combos key input
		scombo.oninput = rcombo.oninput = (e, combo) => {
			if (oninputFunc) oninputFunc(e, combo===scombo);
		};

		// onclick for next/prev/repl/replPrev/all
		let workBtnClick = e => {
			e.stopPropagation();
			scombo.focus();
			if (changeFunc) {
				let id=e.currentTarget.dataset.id;
				changeFunc(id);
			}
		};

		// onkeydown for next/prev/repl/replPrev/all
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

		// onclick for the option buttons
		let optBtnClick = e => {
			e.stopPropagation();
			let btn=e.currentTarget, id=btn.dataset.id;

			let t=toggleOpt(btn);
			if (id==='regex') disableOpt('wholeWord', t);

			scombo.focus();
			if (optchangeFunc) optchangeFunc(id);
		};
		optBtnsArr.forEach(btn => { btn.onclick=optBtnClick; });

		// onclick for the options panel toggle btn
		getElem('optToggler').onclick = e => { 
			toggleOptPanel(); 
		}

		// onclick anywhere else
		sboxElem.onclick = e => { 
			e.stopPropagation(); 
			scombo.focus(); 
		}
		
		// combo blur
		scombo.onblur = rcombo.onblur = e => { 
			if (blurFunc) {
				let relatedTarget=e.relatedTarget ? e.relatedTarget : document.activeElement;
				if (!sboxElem.contains(e.relatedTarget)) blurFunc(e);
			}; 
		}
	}

	// constructor
	function ctor(parent_, btnState_) {
		self=this; parent=parent_; btnState=btnState_;

		let outerHtml = `
				<div class="CMsearchBox" style="top:-10000px;left:-10000px;">
					<div data-id="scombo" class="cmsearchCombo"></div>
					<div data-id="rcombo" class="cmsearchCombo" style="margin-top:7px;"></div>
					<div style="min-height: 9px"></div>
					<div style="float:left; ">
						<button data-id="next" class="cmsearchBigBtns" title="Find Next (F3)">&rarr;</button>
						<button data-id="prev" class="cmsearchBigBtns" title="Find Previous (F4)">&larr;</button>
						<button data-id="replaceNext" class="cmsearchBigBtns" title="Replace Next">&#x21D2;</button>
						<button data-id="replacePrev" class="cmsearchBigBtns" title="Replace Previous">&#x21D0;</button>
						<button data-id="replaceAll" class="cmsearchBigBtns" title="Replace All">&#x21D4;</button>
					</div>
					<div style="float:right">
						<button data-id="optToggler" class="cmsearchSmallBtns" title="settings" style="margin-top:4px;margin-right:1px">&#9660;</button> 
					</div>
					<div style="clear:both"></div>
					<div data-id="optBtnsDiv" style="float:right;margin-top:7px;margin-right:1px;display:none;">
						<button data-id="caseSensitive" class="cmsearchSmallBtns" title="Case Sensitive">C</button>
						<button data-id="wholeWord" class="cmsearchSmallBtns" title="Whole Word">W</button>
						<button data-id="regex" class="cmsearchSmallBtns" title="Regular Expression">R</button>
						<button data-id="inSelection" class="cmsearchSmallBtns" title="In Selection">S</button>
						<button data-id="wrapAround" class="cmsearchSmallBtns" title="Wrap Around">A</button>
						<button data-id="highlight" class="cmsearchSmallBtns" title="Highlight">H</button>
						<button data-id="persistent" class="cmsearchSmallBtns" title="Persistent Dialog">P</button>
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

		workBtnsArr=[ getElem('next'), getElem('prev'), getElem('replaceNext'), getElem('replacePrev'), getElem('replaceAll') ]
		optBtnsArr=[ getElem('caseSensitive'), getElem('wholeWord'), getElem('regex'), getElem('inSelection'), getElem('wrapAround'), getElem('highlight'), getElem('persistent') ];

		Object.keys(btnState).forEach(k => toggleOpt(k, btnState[k])); // init options toggled state

		hookEvents();
	}

	// public interface
	return {
		ctor,
		show,
		hide,
		position, // reposition the box if it is visible
		focus,
		notFound,
		overlaps,
		visible,

		get value() { return [ scombo.value, rcombo.value ]; },

		// events
		set onchange(f) { changeFunc=f;  }, // call f(q, op) -> (query,  'next'/'prev'/'replaceNext'/'replacePrev'/replaceAll') 
		set onoptchange(f) { optchangeFunc=f; }, // call f(id, btnState) when an option button is clicked
		set onkeydown(f) { keydownFunc=f;  }, // call f(e, isSearchCombo) when keydown in one of the combos
		set oninput(f) { oninputFunc=f; }, // f(e, isSearchCombo) when oninput in the search combo
		set onblur(f) { blurFunc=f; }, // f()
	};
}


// CodeMirror Search and Replace
function CMsearch() {
	"use strict";
	let cm, btnState, sbox, highlightRegex, matchMark;

	// helpers
	function cmposBefore(p1 ,p2) { return p1.line<p2.line || (p1.line===p2.line && p1.ch < p2.ch);	}
	function cmposAfter(p1 ,p2) { return p1.line>p2.line || (p1.line===p2.line && p1.ch > p2.ch); }
	function cmposEq(p1 ,p2) { return p1.line===p2.line && p1.ch===p2.ch; }
	function cmposFirst() { return { line:0, ch:0}; }
	function cmposLast(cm) {
		let line=cm.lineCount()-1, ch=cm.getLine(line).trim().length;
		while(line>0 &&ch===0) { line--; ch=cm.getLine(line).trim().length; }
		return { line, ch};
	}
	function cmselection() {
		let selections=cm.listSelections();
		if (selections.length===0) return null;
		let selection={ from: selections[0].anchor, to: selections[0].head };
		if (cmposAfter(selection.from, selection.to)) selection={ from: selection.to, to: selection.from }; // force from before to
		return selection;		
	}

	// toggle CSS class, If newState is provided add/remove theClass accordingly, otherwise toggle theClass
	function toggleClass(elem, theClass, newState) {
		let matchRegex = new RegExp('(?:^|\\s)' + theClass + '(?!\\S)', 'g');
		let add = (arguments.length > 2 ? newState : (elem.className.match(matchRegex) === null));

		elem.className = elem.className.replace(matchRegex, ''); // clear all
		if (add) elem.className += ' ' + theClass;
	}

	// toggle class on CM cursors div
	function cmToggleCursorsClass(cm, theClass, newState) {
		toggleClass(cm.getWrapperElement().getElementsByClassName('CodeMirror-cursors')[0], theClass, newState); 
	}

	// toggle class on all individual CM cursors
	function cmToggleCursorsInnerClass(cm, theClass, newState) {
		let cursors=Array.from(cm.getWrapperElement().getElementsByClassName('CodeMirror-cursor'));
		cursors.forEach(c => { toggleClass(c, theClass, newState); });
	}

	// convert string to regex
	function regExFromString(q) { 
		let flags = q.replace(/.*\/([gimuy]*)$/, '$1');
		if (flags===q) flags='';
		let pattern=(flags ? q.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1') : q);
		flags.replace('g', ''); // remove g flag
		try { return new RegExp(pattern, flags); } catch(e) { return null; }
	}

	// clear the search mark
	function clearMark() {
		if (matchMark) { matchMark.clear(); matchMark=null; }
	}

	// process a new query
	function getFindRegex() {
		let q=sbox.value[0], findRegex;
		if (q===undefined || q===null) return null;

		if (btnState.regex) {
			findRegex=regExFromString(q);
		} else {
			q=q.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
			if (q && btnState.wholeWord) q='\\b'+q+'\\b';
			findRegex=new RegExp(q);
		}
		if (findRegex) findRegex=new RegExp(findRegex.source, btnState.caseSensitive ? '' : 'i'); // add case flag
		return findRegex;
	}

	// update highlight overlay
	function doHighlight() {
		let findRegex=getFindRegex();
		highlightRegex=findRegex && sbox.value[0].length>1 ? new RegExp(findRegex.source, findRegex.flags+'g') : null;
		if (highlightRegex) highlightRegex.lastIndex=0;
		cm.setOption('maxHighlightLength', (--cm.options.maxHighlightLength) +1); // hack to rerun the overlay
	}

	// hide highlight overlay
	function hideHighlight() {
		highlightRegex=null;
		cm.setOption('maxHighlightLength', (--cm.options.maxHighlightLength) +1); // hack to rerun the overlay
	}

	// return true if the current selection is exactly the matchPos, used when toggling inSelection
	function selectionIsMatchmark() {
		let selection=cmselection(), pos=(matchMark ? matchMark.find() : null);
		return (btnState.inSelection && selection && pos && cmposEq(pos.from, selection.from) && cmposEq(pos.to, selection.to));
	}

	// calculate area to search/replace in
	function getSearchArea() {
		if (!btnState.inSelection) return { from: cmposFirst(), to: cmposLast(cm) };
		let selection=cmselection(), nullSel={ from: { line:0, ch:0}, to: { line:0, ch:0} };
		if (!selection || selectionIsMatchmark()) return nullSel;
		return selection;
	}

	// blink the cursor as thick red once, blink search combo text and border red once
	function notFound() {
		cmToggleCursorsInnerClass(cm, 'redCursor', true);
		setTimeout(() => { cmToggleCursorsInnerClass(cm, 'redCursor', false); }, 500);

		if (!btnState.inSelection) cm.setSelection(cm.getCursor());
		if (sbox.visible()) sbox.notFound(); else cm.focus();
	}

	// the find workhorse
	function find(fw=true) {
		let findRegex=getFindRegex();
		if (!findRegex) return;

		let sa=getSearchArea();

		let pos, matchPos=(matchMark ? matchMark.find() : null);

		if (btnState.inSelection) {
			pos=(matchPos ? (fw ? matchPos.to : matchPos.from) : sa.from);
		} else {
			pos=cm.getCursor();
			if (matchPos && !fw && cmposEq(pos, matchPos.to)) pos=matchPos.from; 
		}

		let cursor = cm.getSearchCursor(findRegex, pos), found=cursor.find(!fw);
		if (found && btnState.inSelection && (cmposBefore(cursor.from(), sa.from) ||cmposAfter(cursor.to(), sa.to))) found=null;
		if (!found  && btnState.wrapAround) {
			pos=fw ? sa.from : sa.to;
			cursor = cm.getSearchCursor(findRegex, pos);
			found=cursor.find(!fw);
			if (found && btnState.inSelection && (cmposBefore(cursor.from(), sa.from) ||cmposAfter(cursor.to(), sa.to))) found=null;
		}

		if (!found) { notFound(); return false; }
		doHighlight();

		if (!btnState.persistent) { sbox.hide(); cm.focus(); }

		cm.scrollIntoView( {from: cursor.from(), to: cursor.to() }, 20);
		
		if (!btnState.inSelection) cm.setSelection(cursor.from(), cursor.to());

		clearMark();
		matchMark=cm.markText(cursor.from(), cursor.to(), { className: 'cm-searchMatch' }); 

		// scroll if overlapped
		setTimeout(() => { // allow the DOM to update with the new matchMark
			let markElem=cm.getWrapperElement().getElementsByClassName('cm-searchMatch')[0];
			while(sbox.overlaps(markElem.getBoundingClientRect())) { // scroll until sbox not covering match
				let top=cm.getScrollInfo().top;
				if (top<25) break; else cm.scrollTo(null, top-25); 
			};
		}, 0);
		return true;
	}

	// the replace workhorse
	function replace(fw=true) {
		if (!matchMark) return find(fw);

		let findRegex=getFindRegex(), qr=(sbox.value[1] || ''), matchPos=matchMark.find();
		if (!findRegex) { notFound(); return; }

		if (btnState.regex) {
			let match = cm.getRange(matchPos.from, matchPos.to).match(findRegex);
			qr=qr.replace(/\$(\d)/g, function(_, i) { return match[i]; });
		}

		cm.replaceRange(qr, matchPos.from, matchPos.to);
		clearMark(); matchMark=cm.markText(matchPos.from, matchPos.to, { className: 'cm-searchMatch' }); 
				
		find(fw);
	}

	// the replaceAll workhorse
	function replaceAll() {
		let findRegex=getFindRegex(), qr=sbox.value[1];
		if (!findRegex || !qr) { notFound(); return; }

		let sa=getSearchArea();

		let replaced=0;
		cm.operation(function() {
			for (let cursor = cm.getSearchCursor(findRegex, sa.from); cursor.findNext();) {
				if (btnState.inSelection && cmposAfter(cursor.to(), sa.to)) break;

				if (btnState.regex) {
					let match = cm.getRange(cursor.from(), cursor.to()).match(findRegex);
					cursor.replace(qr.replace(/\$(\d)/g, function(_, i) { return match[i]; }));
				} else {
					cursor.replace(qr);
				}
				replaced++;
			}
		});

		if (replaced===0) {
			notFound();
		} else if (!btnState.persistent) {
			sbox.hide();
			cm.focus();
		}
		clearMark();
	}

	// show widget
	function show(withReplace=false) {
		let selection=cm.getSelection(), q;
		if (!btnState.inSelection && selection.length>1 && selection.length<100) {
			q=selection;
			clearMark();
		}
		sbox.show(withReplace, q);
		doHighlight();

	}

	function hide(force) {
		if (!btnState.persistent || force) {
			sbox.hide();
			hideHighlight();
		}
	}

	function hookEvents() {
		// searchBox change
		sbox.onchange = (op) => {
			doHighlight();
			if (op==='next') find();
			else if (op==='prev') find(false);
			else if (op==='replaceNext') replace();
			else if (op==='replacePrev') replace(false);
			else if (op==='replaceAll') replaceAll();
		};

		// searchBox option change
		sbox.onoptchange = (id)  => {
			if (id='inSelection' && selectionIsMatchmark()) cm.setSelection(cm.getCursor());
			clearMark();
			doHighlight();
		};

		// searchBox escape
		sbox.onkeydown = (e, inFind) => {
			if (e.key==='Escape') {
				hide(true);
				cm.focus();
			}
		};

		// combo text change
		sbox.oninput = (e, inFind) => {
			if (inFind) doHighlight();
		};

		// searchBox blur
		sbox.onblur = () => {
			hide();
		};

		// clear matchMark if inSelection and selection changed
		cm.on('beforeSelectionChange', (cm, obj) => {
			if (obj.origin && btnState.inSelection && matchMark) clearMark();
		});

		// clear matchMark and optionally highlight on editor changes
		cm.on('change', (cm, changeObj) => {	
			if (changeObj.origin) {
				if (!sbox.visible()) hideHighlight();
				clearMark();
			}
		});

		// reposition widget on editor resize
		cm.on('refresh', cm => {
			sbox.position();
		});

		// keep an unblinking cursor on when blurring
		cm.on('blur', cm => { cmToggleCursorsClass(cm, 'CodeMirror-cursorsVisible', true); });
		cm.on('focus', cm => {	cmToggleCursorsClass(cm, 'CodeMirror-cursorsVisible', false); });
	}

	function ctor(cm_) {
		cm=cm_;

		// initial option buttons state
		btnState={
			caseSensitive: false, 
			wholeWord: false,
			regex: false,
			wrapAround: false,
			highlight: true,
			inSelection: false,
			persistent: true,
		};

		sbox=SearchBox.New(cm.getWrapperElement(), btnState);

		// the highlight overlay
		cm.addOverlay({
			token: stream => {
				if (!highlightRegex || !btnState.highlight) {
					stream.skipToEnd();
					return;
				}

				highlightRegex.lastIndex = stream.pos;
				let match = highlightRegex.exec(stream.string);
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

		cm.focus(); // as Combo ctors change the focus
		hookEvents();
	}

	// public Interface
	return {
		ctor,
		show,
		hide,
		find,
		replace,
		replaceAll
	}
}


function initCMsearch(cm) {
	// create an instance of SearchAndReplace (held by the key bindings)
	let cmsearch=CMsearch.New(cm);

	// add the key binding, doing a context switchto escape the keypress handler
	cm.addKeyMap({
		'Ctrl-F': cm => cmsearch.show(),
		'Ctrl-G': cm => cmsearch.find(),
		'F3': cm => cmsearch.find(),
		'Shift-Ctrl-G': cm => cmsearch.find(false),
		'Shift-F3': cm => cmsearch.find(false),
		'Shift-Ctrl-F': cm => cmsearch.show(true),
		'Ctrl-H': cm => cmsearch.show(true),
		'Ctrl-F3': cm => cmsearch.replace(), 
		'Shift-Ctrl-H': cm => cmsearch.replace(),
		'Shift-Ctrl-F3': cm => cmsearch.replace(false), 
		'Shift-Ctrl-R': cm => cmsearch.ReplaceAll(),
		'Esc': cm => { cmsearch.hide(true) }
	});
}
