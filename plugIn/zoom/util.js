if(!window['Util']) {
    window['Util'] = {};
}

String.format = function(str) {
    var args = arguments, re = new RegExp("%([1-" + args.length + "])", "g");
    return String(str).replace(
        re,
        function($1, $2) {
            return args[$2];
        }
        );
};

String.formatmodel = function(str,model){
    for(var k in model){
        var re = new RegExp("{"+k+"}","g");
        str = str.replace(re,model[k]);
    }
    return str;
}

Util.CONFIG = {
    SQBrdColor: "#072246",
    SQBgColor: "#6bb0c9",
    SQOpacity: 15,
    SQScrollStep: 6,
    TextBoxDefaultColor: "#BABABA",
    TextBoxActiveColor:"#000",
    IsMac: (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel")
}
Util.DropDown =  (function(){
    var _timeout = 200, _hide_status = "hide_status";
    return {
        Bind: function(st){
            st.Title.bind("click",{
                setting: st
            },function(e){ 
                var setting = e.data.setting;
                if(setting.overtimer) window.clearTimeout(setting.overtimer);
                setting.Title.attr(_hide_status,"0");
                setting.Content.show();
                if(setting.ShowHandler){
                    setting.ShowHandler();
                }
            }).bind("mouseover",{
                setting: st
            },function(e){
                var setting = e.data.setting;
                if(setting.overtimer) window.clearTimeout(setting.overtimer);
                if(setting.IsOverShow){
                    setting.overtimer = window.setTimeout(function(){
                        setting.Title.attr(_hide_status,"0");
                        setting.Content.show();
                        if(setting.ShowHandler){
                            setting.ShowHandler();
                        }
                    },st.Timeout||_timeout);
                }
                if(setting.Title.attr(_hide_status) == "1"){
                    setting.Title.attr(_hide_status,"0");
                }
            }).bind("mouseleave",{
                setting: st
            },function(e){
                var setting = e.data.setting;
                if(setting.timer){
                    window.clearTimeout(setting.timer);
                }
                if(setting.overtimer) window.clearTimeout(setting.overtimer);
                if(setting.Title.attr(_hide_status) == "0"){
                    setting.Title.attr(_hide_status,"1");
                    setting.timer = window.setTimeout(function(){
                        if(setting.Title.attr(_hide_status) == "1"){
                            if(setting.HideHandler){
                                setting.HideHandler();
                            }
                            setting.Content.hide();
                        }
                        window.clearTimeout(setting.timer);
                        delete setting.timer;
                    },st.Timeout||_timeout);
                }
            })
            st.Content.bind("mouseover",{
                setting: st
            },function(e){
                var setting = e.data.setting;
                if(setting.Title.attr(_hide_status) == "1"){
                    setting.Title.attr(_hide_status,"0");
                }
            }).bind("mouseleave",{
                setting: st
            },function(e){
                e.stopPropagation();
                var setting = e.data.setting;
                if(setting.timer){
                    window.clearTimeout(setting.timer);
                }
                if(setting.overtimer) window.clearTimeout(setting.overtimer);
                setting.Title.attr(_hide_status,"1");
                setting.timer = window.setTimeout(function(){
                    if(setting.Title.attr(_hide_status) == "1"){
                        if(setting.HideHandler){
                            setting.HideHandler();
                        }
                        setting.Content.hide();
                    }
                    window.clearTimeout(setting.timer);
                    delete setting.timer;
                },st.Timeout||_timeout);
            }).hide();
        }
    }
})();
Util.Load = {
    _download: function(type, code, complete, isremove){
        $(code).bind("load",function(){
            isremove && $(code).remove();
            if(complete) complete();
        })
        if(type != "css"){
            code.onreadystatechange = (function(){
                if(code.readyState == "complete" || code.readyState == "loaded"){
                    //document.body.removeChild(code);
                    isremove && $(code).remove();
                    if(complete) complete();
                }
            });
        }
        document.body.appendChild(code);
    },
    JS: function(url,complete, isremove){
        if(isremove == undefined){
            isremove = true;
        }
        var code = document.createElement("script");
        code.src = url;
        Util.Load._download("script", code, complete, isremove);
    },
    Css: function(url, complete){
        var code = document.createElement("link");
        code.href = url;
        code.rel = "stylesheet";
        code.type = "text/css";
        Util.Load._download("css", code, complete);
        return;
    }
}

/*
	公共函数
*/
Util.Mouse = (function(){
    var _cache = {
        move: {
            x:0,
            y:0,
            eX:0,
            eY:0
        },	//手动层缓存对象
        line: {
            x:0,
            y:0,
            eX:0,
            eY:0
        },	//拖动线缓存对象
        sq: {
            t:0,
            l:0,
            x:0,
            y:0,
            w:0,
            h:0,
            st:0
        }	//框选缓存对象
    },Return = {};

    //获取透明遮罩层
    var GetLayOutBox = function(){
        if(!_cache.LayOutBox){
            _cache.LayOutBox = $('<div style="z-index: 1000000003; display: none;background: none repeat scroll 0 0 black;height: 100%;left: 0;position: absolute;top: 0;width: 100%;filter:alpha(opacity=0);-moz-opacity:0;opacity:0;"><div style="height:100%;width:100%;"></div></div>');
            $(document.body).append(_cache.LayOutBox);
        }
        return _cache.LayOutBox;
    }
    
    Return.GetLayOutBox = GetLayOutBox;

    //移动层，mouseover函数
    var moveBoxFun = function(e){
        //鼠标移动
        if(_cache.move.state){			
            _cache.move.eX = e.screenX;
            _cache.move.eY = e.screenY;
            var lessX = _cache.move.eX - _cache.move.x;
            var lessY = _cache.move.eY - _cache.move.y;
            if(_cache.move.box){
                var t = _cache.move.sT + lessY;
                var l = _cache.move.sL + lessX;
                
                if(t > _cache.move.maxT){
                    if(_cache.move.maxT !== false){
                        t = _cache.move.maxT;
                    }
                }
                else if(t < _cache.move.minT){
                    if(_cache.move.minT !== false){
                        t = _cache.move.minT;
                    }
                }
                if(l > _cache.move.maxL){
                    if(_cache.move.maxL !== false){
                        l = _cache.move.maxL;
                    }
                }
                else if(l < _cache.move.minL){
                    if(_cache.move.minL !== false){
                        l = _cache.move.minL;
                    }
                }
                _cache.move.box.css({
                    left: l + "px",
                    top: t + "px"
                });
            }
            if(e.data.move_callback){
                e.data.move_callback();
            }
            return false;
        }
    }

    /*
		绑定移动函数
		obj
		{
			ClickBox 	--点击的标签
			Box		--移动的层
		}
	*/
    Return.MoveBox = function(obj){
        var outer = obj.Outer;
        var box = obj.Box;
        obj.ClickBox.attr("ws_property","1");
        obj.ClickBox.bind("mousedown",{
            box:box,
            outer:outer,
            callback:obj.Callback, 
            move_callback: obj.MoveCallback
        },function(e){
            if($(this).attr("stop_move")) return;
            
            _cache.MoveLayOut = GetLayOutBox();
            _cache.MoveLayOut.css({
                cursor:"default"
            });
            var lay = ($.browser.msie)? _cache.MoveLayOut : $(window);
            lay.unbind("mousemove").bind("mousemove",{
                move_callback:e.data.move_callback
            },function(e){
                if(_cache.move.state){
                    _cache.MoveLayOut.show();
                }
                moveBoxFun(e);
                return false;
            });
            lay.unbind("mouseup").bind("mouseup",function(e){
                //鼠标按起来
                if(_cache.move.state){
                    _cache.move.state = false;
                    _cache.MoveLayOut.hide();
                    _cache.MoveLayOut.css({
                        cursor:"default"
                    });
                    if($.browser.msie){
                        _cache.MoveLayOut[0].releaseCapture();
                    }
                //return false;
                }
            });
			
            if($.browser.msie){
                _cache.MoveLayOut[0].setCapture();
            }

            _cache.move.state = true;
            _cache.move.box = e.data.box;
            _cache.move.outer = e.data.outer;
            _cache.move.x = e.screenX;
            _cache.move.y = e.screenY;
            _cache.move.eX = e.screenX;
            _cache.move.eY = e.screenY;
            _cache.move.sT = _cache.move.box.offset().top;
            _cache.move.sL = _cache.move.box.offset().left;
            if(_cache.move.outer){
                var oh = _cache.move.outer.height(), ow = _cache.move.outer.width(),
                    bh = _cache.move.box.height(), bw = _cache.move.box.width();
                _cache.move.minT = _cache.move.outer.offset().top;
                _cache.move.maxT = _cache.move.outer.offset().top + _cache.move.outer.height() - _cache.move.box.height();
                _cache.move.minL = _cache.move.outer.offset().left;
                _cache.move.maxL = _cache.move.outer.offset().left + _cache.move.outer.width() - _cache.move.box.width();
            }
            else{
                _cache.move.minT = false;
                _cache.move.maxT = false;
                _cache.move.minL = false;
                _cache.move.maxL = false;
            }
			
            if(e.data.callback){
                e.data.callback();
            }

            return false;
        });
        return {
            Disable: function(){
                obj.ClickBox.attr("stop_move","1");
            },
            Enable: function(){
                obj.ClickBox.removeAttr("stop_move");
            },
            ChangeSetting: function(moveSetting){
                if(moveSetting){
                    if(!obj.MoveSetting) obj.MoveSetting = {};
                    for(var k in moveSetting){
                        obj.MoveSetting[k] = moveSetting[k];
                    }
                }
            }
        }
    }
	
    /*
		绑定移动线
		line: 拖动的线条
		type: 拖动手势 (e-resize：箭头朝左右方向; n-resize：箭头朝上下方向; w-resize:箭头朝右上左下方向; ne-resize:箭头朝右下方向)
	*/
    Return.MoveLine = function(line,type,callback,mousedown){
        line.css({
            cursor:type
        });
        line.bind("mousedown",{
            type:type,
            callback:callback,
            down:mousedown
        },function(e){
            _cache.MoveLayOut = GetLayOutBox();
            _cache.MoveLayOut.css({
                cursor:e.data.type
            });
            var lay = ($.browser.msie)? _cache.MoveLayOut : $(window);
            //绑定事件
            lay.unbind("mousemove").bind("mousemove",{
                callback:e.data.callback
            },function(e){
                if(_cache.line.state){
                    _cache.line.eX = e.screenX;
                    _cache.line.eY = e.screenY;
					
                    if(e.data.callback){
                        e.data.callback(_cache.line);
                    }
                    return true;
                }
            }).unbind("mouseup").bind("mouseup",function(e){
                if(_cache.line.state){
                    _cache.line.state = false;
                    _cache.MoveLayOut.hide();
                    if($.browser.msie){
                        _cache.MoveLayOut[0].releaseCapture();
                    }
                    _cache.MoveLayOut.css({
                        cursor:"default"
                    });
                    return false;
                }
            });
            _cache.MoveLayOut.show();
            if($.browser.msie){
                _cache.MoveLayOut[0].setCapture();
            }
            _cache.line.state = true;
            _cache.line.x = e.screenX;
            _cache.line.eX = e.screenX;
            _cache.line.y = e.screenY;
            _cache.line.eY = e.screenY;
            if(e.data.down){
                e.data.down();
				
            }
			
            return false;
        })
    }

    /****选择框****/
    //选择框事件对象
    var sqEvent = {
        //鼠标移动事件
        move:function(e){
            if(_cache.sq.movestate){
                var eX = e.screenX, eY = e.screenY;
                var lessX = eX - _cache.sq.sX, lessY = eY - _cache.sq.sY;
				
                var w = Math.abs(lessX);
                var h = Math.abs(lessY);
				
                var t = lessY? _cache.sq.sT : _cache.sq.sT + lessY, l = lessX? _cache.sq.sL : _cache.sq.sL + lessX;
                var oH = _cache.sq.outer.height() - 2;
                var oW = _cache.sq.dom.width() - 2;
                var scrollTop = _cache.sq.outer.scrollTop();
                var scrollLeft = _cache.sq.outer.scrollLeft();
                if(lessY < 0){
                    t = t - h;
                }
                if(lessX < 0){
                    l = l - w;
                }
				
                if(t < 0){
                    h += t;
                    t = 0;
                }
                else if(t > 0 && (t - scrollTop + h) > oH){
                    h = oH - t + scrollTop;
                }
				
                if(l < 0){
                    w += l;
                    l = 0;
                }
                else if(l > 0 && (l - scrollLeft + w) > oW){
                    w = oW - l + scrollLeft;
                }
                _cache.sq.box.height(h).css({
                    width: w + "px", 
                    left: l + "px", 
                    top: t + "px"
                });
				
                if(_cache.events.mousemove){
                    var l = _cache.sq.box.offset().left, t = _cache.sq.box.offset().top, w = _cache.sq.box.width(), h = _cache.sq.box.height();
                    _cache.events.mousemove(l, t, l+w, t+h, e.ctrlKey, e);
                }
                if(_cache.sq.box.css("display") == "none"){
                    _cache.sq.box.show();
                }
                return true;
            }
        },
        //mouseup事件
        up: function(e){
            if(_cache.sq.movestate){
                _cache.sq.box.show();
                if(_cache.events.mouseup){
                    var l = _cache.sq.box.offset().left, t = _cache.sq.box.offset().top, w = _cache.sq.box.width(), h = _cache.sq.box.height();
                    _cache.events.mouseup(l, t, l+w, t+h, e.ctrlKey, e);
                }
                _cache.sq.box.hide();
                _cache.sq.movestate = false;
                _cache.sq.x = _cache.sq.y = _cache.sq.w = _cache.sq.h = _cache.sq.t = _cache.sq.l = _cache.sq.st = 0;
                /*if($.browser.msie){
                    _cache.MoveLayOut && _cache.MoveLayOut[0].releaseCapture();
                }
                _cache.MoveLayOut && _cache.MoveLayOut.hide();*/
                return true;
            }
        }
    }

    /*
		拖动选择
	*/
    Return.Square = function(dom, outer, events){
        //绑定所在页事件
        dom.bind("mousedown",{
            outer:outer
        },function(e){
            
            if($(e.target).attr("menu")) return true;
            
            var box = $(this);
            /*if($.browser.msie){
                _cache.MoveLayOut = GetLayOutBox();
                _cache.MoveLayOut.show();
                _cache.MoveLayOut[0].setCapture();
            }
            var lay = ($.browser.msie)? _cache.MoveLayOut : $(window);*/
            var lay = ($.browser.msie)?$(document) : $(window);
            lay.unbind("mousemove").bind("mousemove",sqEvent.move).unbind("mouseup").bind("mouseup",sqEvent.up);
            
            if(!_cache.sq.box){
                _cache.sq.box = $('<div style="position:absolute; top:0; left:0; border:1px solid '+Util.CONFIG.SQBrdColor+'; background:'+Util.CONFIG.SQBgColor+'; filter:Alpha(Opacity='+Util.CONFIG.SQOpacity+'); opacity:0.'+Util.CONFIG.SQOpacity+'; overflow:hidden; display:none; z-index:99999;"></div>');
                //$(document.body).append(_cache.sq.box);
                box.append(_cache.sq.box);
            }
            
            
            _cache.sq.movestate = true;
            _cache.sq.outer = e.data.outer;
            var scrollTop = _cache.sq.outer.scrollTop();
            var scrollLeft = _cache.sq.outer.scrollLeft();
            _cache.sq.sX = e.screenX;
            _cache.sq.sY = e.screenY;
            _cache.sq.w = 0;
            _cache.sq.h = 0;
            _cache.sq.sT = e.clientY - _cache.sq.outer.offset().top + scrollTop;
            _cache.sq.sL = e.clientX - _cache.sq.outer.offset().left + scrollLeft;
            _cache.sq.dom = box;
            _cache.events = !events? {} : events;
            var defaultLen = (!$.browser.msie)? 0 : 1;
            if(box.css("position") == "absolute" || box.css("position") == "relative"){
                _cache.sq.box.width(defaultLen).height(defaultLen).css({
                    top:_cache.sq.sT + "px", 
                    left: _cache.sq.sL + "px"
                });
            }
            else{
                _cache.sq.box.width(defaultLen).height(defaultLen).css({
                    top:(_cache.sq.sT - scrollTop) + "px", 
                    left: _cache.sq.sL + "px"
                });
            }
            _cache.sq.box.show();
            if(_cache.events.mousedown){
                var l = _cache.sq.box.offset().left, t = _cache.sq.box.offset().top, w = _cache.sq.box.width(), h = _cache.sq.box.height();
                _cache.events.mousedown(l, t, l+w, t+h, e.ctrlKey, e);

            }
            _cache.sq.box.hide();
            /*
            if(!$.browser.msie){
                _cache.sq.box.hide();
            }*/
            
            return true;
        });
        
        try{
            if(parent){
                //绑定父框架事件
                $(parent.document).bind("mousemove", sqEvent.move).bind("mouseup", sqEvent.up);
            }
        }catch(e){}
        return {
            Disable: function(){
                if(_cache.sq.movestate){
                    _cache.sq.movestate = false;
                    _cache.sq.box.hide();
                    _cache.sq.x = _cache.sq.y = _cache.sq.w = _cache.sq.h = _cache.sq.t = _cache.sq.l = _cache.sq.st = 0;
                    if($.browser.msie){
                        _cache.MoveLayOut[0].releaseCapture();
                    }
                    _cache.MoveLayOut.hide();
                    return false;
                }
            }
        }
    }
    /****END 选择框****/

    return Return;
})();


//标签控制
Util.Layer = (function(){
    var _cache = {},Return = {};	//缓存类
	
    //最小化
    Return.Min = function(box,mBox,callback){
        if(!_cache.MinBorder){
            _cache.Minborder = $('<div style="z-index:10000000;background: none repeat scroll 0 0 #fff;filter:alpha(opacity=30);-moz-opacity:0.3;opacity:0.3;border:1px soild #ccc;position:absolute;top:0;left0;display:none;"></div>');
            $(document.body).append(_cache.Minborder);
        }
        //mBox.show();
        var w = box.width(), h = box.height(), t = box.offset().top, l = box.offset().left, eT = mBox.offset().top, eL = mBox.offset().left, eW = mBox.width(), eH = mBox.height();
        _cache.Minborder.width(w).height(h).css({
            left:l,
            top:t
        }).show();
        _cache.Minborder.animate({
            width:eW,
            height:eH,
            top:eT,
            left:eL
        },300,function(){
            _cache.Minborder.hide();
        });

        if(callback){
            callback();
        }
    }
	
    /*
	设置标签居中(左右居中，上下1:2)
	
	*/
    Return.Center = function(box,setting){
        var mainBox;
        var cut = 0, t = 0, l = 0;
        if(setting){
            if(setting.Main){
                mainBox = setting.Main;
                t = mainBox.offset().top;
                l = mainBox.offset().left;
                if(setting && setting.NoAddScrollTop){
                    t -= $(window).scrollTop();
                }
            }
            else{
                mainBox = $(window);
            }
            if(setting.Cut != undefined){
                cut = setting.Cut;
            }
            
            
            
        }
        else{
            mainBox = $(window);
        }
        var cssT = (mainBox.height() - box.outerHeight())/3 + cut + t;
        var cssL = (mainBox.width() - box.outerWidth())/2 + cut + l;
        if(cssT < 0){
            cssT = 0;
        }
        if(cssL < 0){
            cssL = 0;
        }
        var st = 0;
        if(!setting || !setting.NoAddScrollTop){
            st = mainBox.scrollTop();
        }
        if(st){
            cssT += st;
        }
        box.css({
            top: cssT, 
            left: cssL
        });
    }
		
    return Return;
})();


Util.Html = {
    StopPropagation:function(e){
        if($.browser.msie){
            event.cancelBubble=true;
        }else{
            e.stopPropagation();
            e.preventDefault();
        }	//停止冒泡
    }
}

Util.Style = {
    IncludeCss: function(id , url){
        if(!document.getElementById(id)){
            var link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";

            link.type = "text/css";

            link.href = url;

            document.getElementsByTagName("head")[0].appendChild(link);
        }
    },
    RemoveCss: function(id){
        var linkBox = $("#" + id);
        linkBox.remove();
    }
}

Util.Override = function(b, n, o){
    var _super = {};
    var _params = [];
    var _arg = arguments;
    if(_arg.length > 3){
        for(var i = 3, len = _arg.length; i < len; i++){
            _params.push(_arg[i]);
        }
    }
    b.apply(n, _params);
    for(var k in n){
        _super[k] = n[k];
    }
    for(var k in o){
        n[k] = o[k];
    }
    return _super;
}

Util.Image = {
    Rotate: function(img, num){
        if(num == undefined){
            num = 0;
        }
        
        var deg = num * 90;
        
        if($.browser.msie){
        if(num > 3){
            num = 0;
        }
        }
        
        img.css({
            "-webkit-transform": "rotate("+deg+"deg)",
            "-moz-transform": "rotate("+deg+"deg)",
            "-o-transform": "rotate("+deg+"deg)",
            "filter": "progid:DXImageTransform.Microsoft.BasicImage(Rotation="+num+")"
        });
        
        return num;
    }
};