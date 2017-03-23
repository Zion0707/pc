var VW = window['VW'] || {};

;
(function(){
    var _events = {
        CLICK: 'click',
        TOUCHSTART: 'touchstart',
        TOUCHMOVE: 'touchmove',
        MOUSEDOWN: 'mousedown',
        MOUSEMOVE: 'mousemove',
        MOUSEUP: 'mouseup'
    }
    var IS_IPAD = false;
    if (navigator.platform.toString().toLowerCase() == "ipad") {
        _events.CLICK = "touchend";
        _events.MOUSEDOWN = "touchstart";
        _events.MOUSEMOVE = "touchmove";
        _events.MOUSEUP = "touchend";
        IS_IPAD = true;
    }
    var _cache = {},
    _load_timer;
    var _config = {
        resize_step: 10,
        resize_one_step: 80
    };
    var _sildeShowStatus = false;
    
    if($.browser.msie && $.browser.version < 9){
        _config.resize_step = 30;
        _config.resize_one_step = 120;
    }
    
    var _cssKey = 'js_viewer_css_20160729';
    
    
    var resize = {
        
        center_left: function(){
            var cssL = (_cache.ctrls.main.width() - _cache.ctrls.pic.width())/2 - _cache.ctrls.main.offset().left;
            if(cssL < 0){
                cssL = 0;
            }
            _cache.ctrls.pic.css({
                left: cssL
            });
        },
        
        max: function(step){
            
            if(!step){
                step = _config.resize_step;
            }
            
            var oldW = _cache.ctrls.pic.width();
            var w = oldW + step;
            
            if(w > _cache.ctrls.main.width() * 5){
                w = _cache.ctrls.main.width() * 5;
            }
            
            _cache.ctrls.pic.width(w);
            
            if(w > 800 && _cache.ctrls.pic.attr('ackey') == 800 && _cache.data_urls.length >= 4){
                _cache.ctrls.pic.attr('src', _cache.data_urls[3]);
                _cache.ctrls.pic.attr('ackey', 1440);
            }
            
            /*
            if(w > 1440 && _cache.ctrls.pic.attr('ackey') == 1440 && _cache.data_urls.length >= 5){
                _cache.ctrls.pic.attr('src', _cache.data_urls[4]);
                _cache.ctrls.pic.attr('ackey', 'all');
            }*/
            
            var picTop = _cache.ctrls.pic.offset().top - $(window).scrollTop()
            
            _cache.ctrls.pic.css({
                left: _cache.ctrls.pic.offset().left - (step / 2)
            });
            var nt = picTop - (step / 2);
            if(picTop >= 0 && nt < 0){
                nt = 0;
            }
            _cache.ctrls.pic.css({
                top: nt
            });
            this.min_pic();
        },
        min: function(step){
            if(!step){
                step = _config.resize_step;
            }
            
            var oldW = _cache.ctrls.pic.width();
            var w = oldW - step;
            if(w < 100){
                w = 100;
            }
            _cache.ctrls.pic.width(w);
            
            
            var picTop = _cache.ctrls.pic.offset().top - $(window).scrollTop()
            
            _cache.ctrls.pic.css({
                left: _cache.ctrls.pic.offset().left + (step / 2)
            });
            
            
            var nt = picTop + (step / 4);
            if(picTop <= 0 && _cache.ctrls.pic.height() > _cache.ctrls.main.height()){
                nt = picTop;
            }
            _cache.ctrls.pic.css({
                top: nt
            //top: picTop
            });
            
            this.min_pic();
        },
        min_pic: function(){
            
            var sll = _cache.ctrls.pic.width();
            var stt = _cache.ctrls.pic.height();
            if(!Number(_cache.ctrls.pic.attr('rotate')) &&  (_cache.ctrls.main.width() < sll || _cache.ctrls.main.height() < stt)){
                var par = _cache.ctrls.min_pic.parent();
                var b = par.find('b');
                
                var maxPH = _cache.ctrls.pic.height(), 
                maxPW = _cache.ctrls.pic.width();
                
                
                var mainW = _cache.ctrls.main.width(),
                mainH = _cache.ctrls.main.height();
                
                var minPH, 
                minPW;
                if(maxPH > maxPW){
                    minPH = 100;
                    minPW = maxPW * minPH / maxPH
                }
                else{
                    minPW = 120;
                    minPH = maxPH * minPW / maxPW
                }
                
                var bH, bW;
                if(maxPH > maxPW){
                    bH = mainH * minPH / maxPH;
                    if(mainW > maxPW){
                        bW = minPW;
                    }
                    else{
                        bW = mainW * minPW / maxPW;
                    }
                }
                else{
                    bW = mainW * minPW / maxPW;
                    if(mainH > maxPH){
                        bH = minPH;
                    }
                    else{
                        bH = mainH * minPH / maxPH;
                    }
                }
                
                _cache.ctrls.min_pic.width(minPW).height(minPH);
                
                b.height(bH).width(bW);
                
                par.is(':hidden') && par.show();
                this.account_min_top();
                
                if(_cache.moveMinMod){
                    
                    if(maxPH > maxPW){
                        var ll = (par.width() - minPW)/2;
                        _cache.moveMinMod.ChangeSetting({
                            minT: 0,
                            maxT: _cache.ctrls.min_pic.parent().height() - b.height(),
                            minL: ll,
                            maxL: _cache.ctrls.min_pic.parent().width() - b.width() - ll
                        });
                    }
                    else{
                        var ll = (par.height() - minPH)/2
                        _cache.moveMinMod.ChangeSetting({
                            minT: ll,
                            maxT: _cache.ctrls.min_pic.parent().height() - b.height() - ll,
                            minL: 0,
                            maxL: _cache.ctrls.min_pic.parent().width() - b.width()
                        });
                    }
                }
                
                _cache.ctrls.pic.css({
                    'cursor': 'move'
                });
            }
            else{
                _cache.ctrls.min_pic.parent().hide();
                _cache.ctrls.pic.css({
                    'cursor': ''
                });
            }
        },
        account_min_top: function(){
            var par = _cache.ctrls.min_pic.parent();
            var b = par.find('b');
            
            var t = ((_cache.ctrls.pic.offset().top - _cache.ctrls.main.offset().top) * b.height() / _cache.ctrls.main.height())
            
            var l = ((_cache.ctrls.pic.offset().left - _cache.ctrls.main.offset().left) * b.width() / _cache.ctrls.main.width())
            var minW = _cache.ctrls.min_pic.width();
            var minH = _cache.ctrls.min_pic.height();
            if(minW < minH){
                t = -t;
                l = -l + ((par.width() - minW)/2);
            }
            else{
                t = -t + ((par.height() - minH)/2);
                l = -l;
            }
            
            
            var mainW = _cache.ctrls.main.width(),
            mainH = _cache.ctrls.main.height(),
            maxPW = _cache.ctrls.pic.width(),
            maxPH = _cache.ctrls.pic.height();
                
            if(maxPW < maxPH){
                if(maxPW < mainW){
                    l = (par.width() - minW)/2;
                }
            }
            else{
                if(maxPH < mainH){
                    l = (par.height() - minH)/2;
                }
            }
            
            b.css({
                top: t, 
                left: l
            });
        },
        move_callback: function(){
            var par = _cache.ctrls.min_pic.parent();
            var b = par.find('b');
            
            var bt = b.offset().top - par.offset().top,
            bl = b.offset().left - par.offset().left,
            bh = b.height(),
            bw = b.width();
            
            var mainW = _cache.ctrls.main.width(),
            mainH = _cache.ctrls.main.height(),
            maxPW = _cache.ctrls.pic.width(),
            maxPH = _cache.ctrls.pic.height(),
            minH = _cache.ctrls.min_pic.height(),
            minW = _cache.ctrls.min_pic.width();
            if(maxPW > maxPH){
                if(maxPH > mainH){
                    var l  = bl * maxPW / minW;
                    var t = (bt - ((par.height() - minH) / 2) + bh) * maxPH / minH - mainH; 
                    _cache.ctrls.pic.css({
                        top: -t, 
                        left: -l
                    });
                }
                else{
                    var l  = bl * maxPW / minW;
                    _cache.ctrls.pic.css({
                        top: -l
                    });
                }
            }
            else{
                if(maxPW > mainW){
                    var t  = bt * maxPH / minH;
                    var l = (bl - ((par.width() - minW) / 2) + bw) * maxPW / minW - mainW; 
                    _cache.ctrls.pic.css({
                        top: -t, 
                        left: -l
                    });
                }
                else{
                    var t  = bt * maxPH / minH;
                    _cache.ctrls.pic.css({
                        top: -t
                    });
                }
            }
        },
        load_resize: function(){
            var el = _cache.ctrls.pic;
            var h = el.height();
            var wH = $(window).height();
            var w = el.width();
            var wW = $(window).width();
            
            
            
            
            if(h > w){
                if(wH - 20 < h){
                    var isBig = $(document).width() > 1460;
                    var defaultWidth = 800;
                    if(isBig){
                        defaultWidth = 1440;
                    }
                    
                    var oldH = h;
                    h = wH - 20;
                    var newW  = defaultWidth * h /  oldH;
                    if(newW > el.width()){
                        newW = el.width();
                    }

                    el.width(newW);
                }
            }
            else{
                if(wW - 20 < w){
                    var oldW = w;
                    w = wW - 20;
                    var newH  = (wH - 20) * w /  oldW;
                    if(newH > el.height()){
                        newH = el.height();
                    }
                    el.width(w * newH / h);
                }
            }
            Util.Layer.Center(_cache.ctrls.pic, {
                Main:_cache.ctrls.main,
                NoAddScrollTop: true
            });
            
            resize.center_left();
            resize.min_pic();
            _cache.ctrls.pic.css('visibility', '');
        },
        rotate: function(isBack){
            var img = _cache.ctrls.pic;
            
            var rotate = Number(img.attr("rotate"));
            var num;
            if(rotate){
                if(isBack){
                    num = Number(img.attr("rotate")) - 1;
                }
                else{
                    num = Number(img.attr("rotate")) + 1;
                }
            }
            else{
                if(isBack){
                    if ($.browser.msie && $.browser.version < 10) {
                        num = 3;
                    }
                    else{
                        num = -1;
                    }
                }
                else{
                    num = 1;
                }
            }
            
            if ($.browser.msie && $.browser.version < 10) {
                if(num < 0){
                    num = 3;
                }
                if(num == 4){
                    num = 0;
                }
            }
            
            var res = Util.Image.Rotate(img, num);
            img.attr("rotate", res);
            
            var caNum = Math.abs(res) % 4;
            if(caNum){
                _cache.ctrls.zooms.addClass('disabled');
            }
            else{
                _cache.ctrls.zooms.removeClass('disabled');
                
            }
            
            if ($.browser.msie && $.browser.version < 10) {
                resize.load_resize();
            }
            
            resize.min_pic();
            
        }
    };
    
    var doLoad = function(data){
        var urls = data['all_url'];
        urls.push(data.url);
        urls.push(data.source_url);
        
        if(data.source_url){
            _cache.dom.find('[data-btn="source"]').css({
                'display': ''
            }).off('click').on('click', function(){
                window.open(data.source_url);
                return false;
            });
        }
        else{
            _cache.dom.find('[data-btn="source"]').hide();
        }
        _cache.ctrls.pic.css({
            visibility: 'hidden'
        });
        _cache.ctrls.pic.on('load', function(){
            window.setTimeout(function(){
                resize.load_resize();
                _cache.ctrls.pic.css({
                    visibility: ''
                }).hide();
                if($.browser.msie && $.browser.version <= 7){
                    _cache.ctrls.pic.show();
                }
                else{
                    _cache.ctrls.pic.fadeIn(200);
                }
                
                _cache.ctrls.pic.off('load');
                if(_sildeShowStatus){
                    doSildeShowFun();
                }
            }, 10);
            _cache.ctrls.loadImage.hide();
        }).on('error', function () {
            _cache.ctrls.loadImage.hide();
        })
        
        var url;
        
        var isBig = $(document).width() > 1460;
        if(urls.length >= 3){
            url = urls[2];
            
            if(isBig){
                if(urls.length >= 4){
                    url = urls[3];
                }
            }
        }
        else{
            url = url[0];
        }
        _cache.ctrls.loadImage.show();
        _cache.ctrls.pic.attr('src', url);
        if(isBig){
            _cache.ctrls.pic.attr('ackey', 1440);
        }
        else{
            _cache.ctrls.pic.attr('ackey', 800);
        }
        
        _cache.data_urls = urls;
    }
    
    var getUrl = function (pick_code, callback) {
        if(VW.Screen.Actions && VW.Screen.Actions['load_data']){
                fireAction('load_data', _cache.ac_info, function(r){
                    callback && callback(r);
                });
        }
        else{
        var data = {};
        //data.flag = 3;
        data.pickcode = pick_code;
        UA$.ajax({
            url: '/files/image',
            data:data,
            type:"GET",
            dataType:"json",
            cache:false,
            success:function (r) {
                callback && callback(r);
            }
        });
    }
    }
    
    var clearPic = function(){
        _cache.ctrls.pic.css({
            top:'', 
            left:'',
            width:'', 
            height:''
        });
        
        Util.Image.Rotate(_cache.ctrls.pic);
        _cache.ctrls.zooms.removeClass('disabled');
        _cache.ctrls.pic.removeAttr("rotate");
        _cache.ctrls.pic.css('visibility', 'hidden');
        
    }
    
    var bindPicEvents = function(){
        var line = {}, MoveLayOut;
        var is_showcontextmenu = false;
        _cache.ctrls.pic.on("contextmenu",function(e){
            e.stopPropagation();
            is_showcontextmenu = true;
        line.state = false;
            MoveLayOut.hide();
        });
        _cache.ctrls.pic.on('click', function(e){
            e.stopPropagation();
            return false;
        });
        _cache.ctrls.pic.on(_events.MOUSEDOWN,function(e){
            if(e.button == 2)return true;
            if(is_showcontextmenu){
                is_showcontextmenu = false;
                return true;
            }
            var ra = Number(_cache.ctrls.pic.attr('rotate'));
            if(ra && ra % 4 != 0) return true;
            MoveLayOut = Util.Mouse.GetLayOutBox();
            MoveLayOut.css({
                cursor: 'move'
            });
            var lay = ($.browser.msie)? MoveLayOut : $(window);
            var downTimer = new Date().getTime();
            //绑定事件
            var isMove = false;
            lay.off(_events.MOUSEMOVE).on(_events.MOUSEMOVE,function(e){
                if(line.state){
                    if(is_showcontextmenu){
                        line.state = false;
                        MoveLayOut.hide();
                        if($.browser.msie){
                            MoveLayOut[0].releaseCapture();
                        }
                        is_showcontextmenu = false;
                        return true;
                    }

                    if(IS_IPAD){
                        if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length){
                            var eSource = e.originalEvent.touches[0];
                            line.eX = eSource.screenX;
                            line.eY = eSource.screenY;
                        }
                    }
                    else{
                        line.eX = e.screenX;
                        line.eY = e.screenY;
                    }
                    if(line.eX != line.x || line.eY != line.y){
                        isMove = true;
                    }
                    var t = line.ot + (line.eY - line.y);
                    var mainH = _cache.ctrls.main.height(),
                    mainW = _cache.ctrls.main.width();
                    if(_cache.ctrls.pic.height() > mainH){
                        if(t > 0){
                            t = 0;
                        }
                        if(t < 0){
                            if(t + _cache.ctrls.pic.height() < _cache.ctrls.main.height()){
                                t = _cache.ctrls.main.height() - _cache.ctrls.pic.height();
                            }
                        }
                    }


                    var l = line.ol + (line.eX - line.x);

                    if(_cache.ctrls.pic.width() > mainW){
                        if(l > 0){
                            l = 0;
                        }
                        if(l < 0){
                            if(l + _cache.ctrls.pic.width() < _cache.ctrls.main.width()){
                                l = _cache.ctrls.main.width() - _cache.ctrls.pic.width();
                            }
                        }
                    }

                    _cache.ctrls.pic.css({
                        top: t, 
                        left: l
                    });

                    resize.min_pic();
                    if(!_cache.ctrls.close_btn.is(':hidden')){
                        _cache.ctrls.file_name.hide();
                        _cache.ctrls.close_btn.hide();
                        _cache.ctrls.pause_btn.hide();

                    }
                    return true;
                }
            }).off(_events.MOUSEUP).on(_events.MOUSEUP,function(e){
                if(line.state){
                    if(e.button == 2) return true;
                    var upTimer = new Date().getTime();
                    if(IS_IPAD){
                        _cache.ctrls.close_btn.show();
                        if(upTimer - downTimer < 500 && !isMove){
                            _cache.dom.find('[data-auto]').toggle();
                        }
                    }
                    else{
                        if(upTimer - downTimer < 500 && !isMove){
                            if(is_showcontextmenu){
                                line.state = false;
                                MoveLayOut.hide();
                                if($.browser.msie){
                                    MoveLayOut[0].releaseCapture();
                                }
                                is_showcontextmenu = false;
                                return true;
                            }
                            minFileList.next();
                        }
                    }
                    line.state = false;
                    MoveLayOut.hide();
                    if($.browser.msie){
                        MoveLayOut[0].releaseCapture();
                    }
                    MoveLayOut.css({
                        cursor:"default"
                    });
                    _cache.move_pic_status = false;
                    return false;
                }
            });

            _cache.move_pic_status = true;
            MoveLayOut.show();
            if($.browser.msie){
                MoveLayOut[0].setCapture();
            }
            line.state = true;
            if(IS_IPAD){
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length){
                    var eSource = e.originalEvent.touches[0];
                    line.x = eSource.screenX;
                    line.eX = eSource.screenX;
                    line.y = eSource.screenY;
                    line.eY = eSource.screenY;
                }
            }
            else{
                line.x = e.screenX;
                line.eX = e.screenX;
                line.y = e.screenY;
                line.eY = e.screenY;
            }
            line.ot = _cache.ctrls.pic.offset().top - $(window).scrollTop();
            line.ol = _cache.ctrls.pic.offset().left;
            return false;
        });
    }
    
    //加载图片
    var loadPic = function(){
        var oldPic;
        if(_cache.ctrls.pic.attr('src') != ''){
            //_cache.ctrls.pic.attr('src', '');
            oldPic = _cache.ctrls.pic;
            _cache.ctrls.pic = $('<img src="" alt="" data-rel="pic" style="display:none;background:#fff;" />');
            oldPic.before(_cache.ctrls.pic);
            bindPicEvents();
        }
        clearPic();
        window.setTimeout(function(){
            var picBox = _cache.ctrls.pic;
            picBox.css({
                width : '', 
                height: ''
            }).show();
            
            _cache.ctrls.min_pic.attr('src',  _cache.ac_info.min_pic);
            picBox.removeAttr('ackey');
            
            _cache.ctrls.file_name.html( _cache.ac_info.file_name + (_cache.ac_info.file_size?' <span style="font-size:12px;font-weight:normal;">('+Util.File.ShowSize(_cache.ac_info.file_size)+')</span>':'') );
            
            minFileList.focus();
            var st = _cache.ac_info.is_star;
            var sbtn = _cache.dom.find('[data-btn="star"]');
            if(st){
                sbtn.addClass('ipo-star-active');
            }
            else{
                sbtn.removeClass('ipo-star-active');
            }
            
            if(_load_timer) window.clearTimeout(_load_timer);
            _load_timer = window.setTimeout(function(){
                if($.browser.msie && $.browser.version <= 7){
                    if(!_cache.ac_info.source){
                        if(oldPic){
                            oldPic.hide();
                            oldPic.empty().remove();
                        }
                        getUrl(_cache.ac_info.pick_code, function(r){
                            doLoad(r.data);
                        });
                    }
                    else{
                        if(oldPic){
                            oldPic.hide();
                            oldPic.empty().remove();
                        }
                        doLoad(_cache.ac_info.source);
                    }
                }
                else{
                    if(!_cache.ac_info.source){
                        oldPic && oldPic.fadeOut(200, function(){
                            oldPic.empty().remove();
                        });
                        getUrl(_cache.ac_info.pick_code, function(r){
                            doLoad(r.data);
                        });
                    }
                    else{
                        oldPic && oldPic.fadeOut(200, function(){
                            oldPic.empty().remove();
                        });
                        doLoad(_cache.ac_info.source);
                    }
                }
                minFileList.load_next_statue = false;
            }, 100);
        }, 1);
    }
    
    var fireAction = function(type){
        var arg = arguments;
        var params = [];
        if(arg.length > 1){
            for(var i = 1,len = arg.length; i < len; i++){
                params.push("arg["+i+"]");
            }
        }
        if(VW.Screen.Actions && VW.Screen.Actions[type]){
            eval("var res = VW.Screen.Actions." + type + "("+params.join(",")+")");
            return res;
        }
    }
    
    var closeScreen = function(){
        if(_sildeShowStatus){
            stopSildeShow();
        }
        _cache.dom.hide();
        VW.IsOpenPic = false;
        _cache.ctrls.pic.attr('src', '');
        try{
            if(_cache['win'] && _cache['win']['oofUtil']) {
                setTimeout(function(){
                    _cache['win']['oofUtil'].focusWindow();
                },200);
            }
        }catch(e){
            
        }
    }
    
    //幻灯片
    var _sildeTimer;
    var stopSildeShow = function(){
        if(_sildeTimer){
            if(_sildeTimer) window.clearTimeout(_sildeTimer);
        }
        _sildeShowStatus = false;
    }
    
    var doSildeShowFun = function(){
        if(_sildeShowStatus){
            if(_sildeTimer) window.clearTimeout(_sildeTimer);
            _sildeTimer = window.setTimeout(function(){
                minFileList.next();
            }, 5000);
        }
    }
    
    var sildeShow = function(){
        if(!_sildeShowStatus){
            _sildeShowStatus = true;
            doSildeShowFun();
            minFileList.next();
            hideCtrls('left');
            hideCtrls('bottom');
            _cache.ctrls.pause_btn.show();
        }
    }
    
    //ui控制
    var ui = function(){
        if(!_cache.dom){
            _cache.dom = $('<div class="previewer-container" style="z-index:999999999; display:none;position: fixed;top: 0;right: 0;bottom: 0;left: 0;" data-rel="main">'+
                '<div class="pvc-close"><a href="javascript:;" data-btn="close">关闭</a></div>'+
                '<div class="pvc-pause">'+
                '<a href="javascript:;" style="display:none;" data-btn="pause"><i>暂停</i><s class="l"></s><s class="r"></s></a>'+
                '</div>'+
                '<div class="pvc-box">'+
                '<div class="pvc-photo-wrap">'+
                '<img data-rel="load" src="/common/images/v2/previewer/loader.gif" style="position: absolute;left: 50%;top: 50%;margin: -32px 0 0 -32px;z-index: 2;display:none;">'+
                '<img src="" alt="" style="background:#fff;" data-rel="pic" />'+
                '</div>'+
                '<div class="pvc-thumb" style="display:none;">'+
                '<img src="" style="background:#fff;" alt="" data-rel="min_pic" style="width:100px;" />'+
                '<b style="top:0;cursor:move;"><s></s></b>'+
                '</div>'+
                '<div class="pvc-photo-name" data-rel="file_name"></div>'+
                '<div class="pvc-side-nav" data-auto="left">'+
                '<a href="javascript:;" class="pv-prev" data-btn="prev">上一个</a>'+
                '<a href="javascript:;" class="pv-next" data-btn="next">下一个</a>'+
                '</div>'+
                '<div class="pvc-option" data-rel="option" style="z-index: 999;">'+
                '<div class="pvco-list">'+
                //'<a href="javascript:;" class="icon-pvco ipo-share" data-btn="share" style="display: none;">发送</a>'+
                '<a href="javascript:;" class="icon-pvco ipo-star" data-btn="star">收藏</a>'+
                '<a href="javascript:;" class="icon-pvco ipo-more" data-ui-btn="more">更多</a>'+
                '</div>'+
                '<div class="pvco-popup" style="display:none;" data-ui-rel="btn_box">'+
                '<s class="arrow"></s><b class="arrow"></b>'+
                '<a href="javascript:;" data-btn="magic"><i class="icon-pvco ipo-beauty"></i><span>美化</span></a>'+
                '<a href="javascript:;" data-btn="source"><i class="icon-pvco ipo-download"></i><span>下载</span></a>'+
                '<a href="javascript:;" data-btn="del"><i class="icon-pvco ipo-remove"></i><span>删除</span></a>'+
                //'<a href="javascript:;" data-btn="source"><i class="icon-pvco ipo-original"></i><span>原图</span></a>'+
                '</div>'+
                '</div>'+
                '<div class="pvc-operate" data-auto="bottom">'+
                '<a href="javascript:;" class="pvo-list" data-btn="file_list">图片列表</a>'+
                '<a href="javascript:;" class="pvo-slideshow" data-btn="silde_show">幻灯播放</a>'+
                '<a href="javascript:;" class="pvo-counterclockwise" data-btn="rotate_l">逆时针旋转</a>'+
                '<a href="javascript:;" class="pvo-clockwise" data-btn="rotate_r">顺时针旋转</a>'+
                '<a href="javascript:;" class="pvo-zoomin" data-zoom-btn="zoom_in">放大</a>'+
                '<a href="javascript:;" class="pvo-zoomout" data-zoom-btn="zoom_out">缩小</a>'+
                '</div>'+
                '</div>'+
                '<div class="pvc-list" data-rel="file_list" data-auto="bottom">'+
                '<div class="pvcl-nav">'+
                '<a href="javascript:;" class="pvl-prev" btn="prev">向前</a>'+
                '<a href="javascript:;" class="pvl-next" btn="next">向后</a>'+
                '</div>'+
                '<div class="pvcl-container">'+
                '<ul></ul>'+
                '</div>'+
                '</div>'+
                '</div>');
            $(document.body).append(_cache.dom);
            _cache.dom.on('click', function(){
                closeScreen();
                return false;
            });
            _cache.dom.find('.pvc-operate,.pvc-photo-name').on('click', function(){
                return false;
            })
            
            var ddSt = {
                IsOverShow: true,
                Title: _cache.dom.find('[data-ui-btn="more"]'),
                Content: _cache.dom.find('[data-ui-rel="btn_box"]')
            }
            Util.DropDown.Bind(ddSt);
            ddSt.Title.on('click', function(e){
                Util.Html.StopPropagation(e);
            });
            _cache.dom.find('[data-rel="option"]').on('mousemove', function(e){
                Util.Html.StopPropagation(e);
                clearCtrlsTimer('left');
                clearCtrlsTimer('bottom');
                _cache.dom.find('[data-auto]').fadeOut();
            })
            
            _cache.ctrls = {
                loadImage:_cache.dom.find('[data-rel="load"]'),
                pic: _cache.dom.find('[data-rel="pic"]'),
                file_list: _cache.dom.find('[data-rel="file_list"]'),
                main: _cache.dom,
                min_pic: _cache.dom.find('[data-rel="min_pic"]'),
                zooms: _cache.dom.find('[data-zoom-btn]'),
                file_name: _cache.dom.find('[data-rel="file_name"]'),
                close_btn: _cache.dom.find('[data-btn="close"]'),
                pause_btn: _cache.dom.find('[data-btn="pause"]')
            }

            var doClick = function(btn){
                switch(btn.attr('data-btn')){
                    case 'pause':
                        stopSildeShow();
                        btn.hide();
                        break;
                    case 'silde_show':
                        sildeShow();
                        break;
                    case 'del':
                        fireAction('del', _cache.ac_info, function(){
                            //成功删除回调
                            minFileList.del(_cache.ac_info);
                        });
                        break;
                    case 'share':
                        fireAction('share', _cache.ac_info);
                        break;
                    case 'magic':
                        fireAction('magic', _cache.ac_info);
                        break;
                    case 'star':
                        fireAction('star', _cache.ac_info, function(st){
                            var sbtn = _cache.dom.find('[data-btn="star"]');
                            if(st){
                                sbtn.addClass('ipo-star-active');
                            }
                            else{
                                sbtn.removeClass('ipo-star-active');
                            }
                        });
                        break;
                    case 'download':
                        fireAction('download', _cache.ac_info);
                        break;
                    case 'next':
                        minFileList.next();
                        break;
                    case 'prev':
                        minFileList.prev();
                        break;
                    case 'close':
                        closeScreen();
                        break;
                    case 'rotate_l':    //逆时针旋转
                        resize.rotate(true);

                        break;
                    case 'rotate_r':    //顺时针旋转
                        resize.rotate();

                        break;
                    case 'file_list':
                        if(!_cache.dom.hasClass('pvc-showlist')){
                            _cache.dom.addClass('pvc-showlist');
                            minFileList.load();
                            btn.attr('is_show', '1');
                        }
                        else{
                            _cache.dom.removeClass('pvc-showlist')
                            btn.removeAttr('is_show');
                        }
                        break;
                }
            }
            _cache.dom.find('.pvc-operate [data-btn]').on('click', function(e){
                e.stopPropagation();
                doClick($(this));
                return false;
            })
            //绑定事件
            _cache.dom.on('click', '[data-btn]', function(){
                var btn = $(this);
                doClick(btn);
                return false;
            });
            
            var moveB = _cache.ctrls.min_pic.parent().find('b');
            _cache.ctrls.min_pic.on('load', function(){
                if(!_cache.moveMinMod){
                    _cache.moveMinMod = Util.Mouse.MoveBox({
                        ClickBox: moveB,
                        Box: moveB,
                        MoveSetting: {
                            minT: 0,
                            maxT: _cache.ctrls.min_pic.parent().height() - moveB.height(),
                            minL: 0,
                            maxL: _cache.ctrls.min_pic.parent().width() - moveB.width()
                        },
                        MoveCallback: function(){
                            resize.move_callback();
                        }
                    });
                }
                else{
                    _cache.moveMinMod.ChangeSetting({
                        maxT: _cache.ctrls.min_pic.parent().height() - moveB.height(),
                        maxL: _cache.ctrls.min_pic.parent().width() - moveB.width()
                    });
                }
            });
            
            _cache.ctrls.min_pic.parent().hide();
            
            //resize
            var inOver = false, outOver = false, overTimer, inStatus = false, outStatus = false;
            _cache.dom.find('[data-zoom-btn="zoom_in"]').on('mousedown', function(){
                if($(this).hasClass('disabled')) return true;
                if(overTimer) window.clearTimeout(overTimer);
                inOver = window.setInterval(function(){
                    resize.max();
                    inStatus = true;
                }, 20);
            }).on('mouseup', function(){
                if($(this).hasClass('disabled')) return true;
                if(inOver) window.clearInterval(inOver);
                if(!inStatus) resize.max(_config.resize_one_step);
                inStatus = false;
            }).on('mouseleave', function(){
                if($(this).hasClass('disabled')) return true;
                if(inOver) window.clearInterval(inOver);
                inStatus = false;
            }).on('click', function(){
                return false;
            });

            _cache.dom.find('[data-zoom-btn="zoom_out"]').on('mousedown', function(){
                if($(this).hasClass('disabled')) return true;
                if(overTimer) window.clearTimeout(overTimer);
                outOver = window.setInterval(function(){
                    resize.min();
                    outStatus = true;
                }, 20);
            }).on('mouseup', function(){
                if($(this).hasClass('disabled')) return true;
                if(outOver) window.clearInterval(outOver);
                if(!outStatus) resize.min(_config.resize_one_step);
                outStatus = false;
            }).on('mouseleave', function(){
                if($(this).hasClass('disabled')) return true;
                if(outOver) window.clearInterval(outOver);
                outStatus = false;
            }).on('click', function(){
                return false;
            });
            
            var scrollFunc=function(e){
                if(_cache.dom && !_cache.dom.is(':hidden')){
                    var par = _cache.ctrls.min_pic.parent();
                    if(!par.is(':hidden')){
                        e=e || window.event;
                        var step = 6;
                        if(e.wheelDelta){//IE/Opera/Chrome 
                            if(e.wheelDelta < 0){
                                step = -step;
                            }
                        }else if(e.detail){//Firefox 
                            if(e.detail < 0){
                                step = -step;
                            }
                        }
                        
                        step = e.wheelDelta || e.detail;
                        if(Util.CONFIG.IsMac){
                            step = step / 5;
                        }
                        else{
                            step = step / 2;
                        }
                        var t = _cache.ctrls.pic.offset().top - $(window).scrollTop() + step;
                        
                        var mainH = _cache.ctrls.main.height();
                        if(_cache.ctrls.pic.height() > mainH){
                            if(t > 0){
                                t = 0;
                            }
                            if(t < 0){
                                if(t + _cache.ctrls.pic.height() < _cache.ctrls.main.height()){
                                    t = _cache.ctrls.main.height() - _cache.ctrls.pic.height();
                                }
                            }
                        }
                        
                        _cache.ctrls.pic.css({
                            top: t
                        });

                        resize.min_pic();
                    }
                    return false;
                }
                else{
                    return true;
                }
            }
            
            /*注册事件*/ 
            if(document.addEventListener){ 
                document.addEventListener('DOMMouseScroll',scrollFunc,false); 
            }//W3C 
            window.onmousewheel=document.onmousewheel=scrollFunc;//IE/Opera/Chrome/Safari 
            
            $(document).on('keydown', function(e, b){
                if(!_cache.dom.is(':hidden')){
                    switch(e.keyCode){
                        case 68:
                        case 46:
                            if(_cache.ac_info){
                                if(_cache.ctrls.close_btn.is(':hidden')){
                                    _cache.ctrls.file_name.show();
                                    _cache.ctrls.close_btn.show();
                                    
                                    if(_sildeShowStatus){
                                        _cache.ctrls.pause_btn.show();
                                    }
                                }
                                fireAction('del', _cache.ac_info, function(){
                                    //成功删除回调
                                    minFileList.del(_cache.ac_info);
                                });
                                return false;
                            }
                            break;
                        case 38:
                            //UP
                            if(!_cache.ctrls.zooms.hasClass('disabled')){
                                resize.max(_config.resize_one_step);
                            }
                            return false;
                        case 40:
                            //down
                            if(!_cache.ctrls.zooms.hasClass('disabled')){
                                resize.min(_config.resize_one_step);
                            }
                            return false;
                        case 39:
                            //right
                            minFileList.next();
                            return false;
                        case 37:
                            //left
                            minFileList.prev();
                            return false;
                        case 27:
                            closeScreen();
                            return false;
                    }
                }
            });
            
            
            bindPicEvents();
            
            _cache.dom.find('[data-auto]').on('mousemove', function(e){
                Util.Html.StopPropagation(e);
                if(_cache.ctrls.close_btn.is(':hidden')){
                    _cache.ctrls.file_name.show();
                    _cache.ctrls.close_btn.show();
                    if(_sildeShowStatus){
                        _cache.ctrls.pause_btn.show();
                    }
                }
                listenName();
            });
            
            
            _cache.dom.on('mousemove', function(e){
                var oX = e.pageX, oY = e.pageY - $(window).scrollTop();
                var el = _cache.dom;
                var w = el.width(), h = el.height();
                var leng = 150;
                if(oX < leng || w - oX < leng){
                    showCtrls('left');
                }
                else{
                    hideCtrls('left');
                }
                if(h - oY < leng){
                    showCtrls('bottom');
                }
                else{
                    hideCtrls('bottom');
                }
                
                if(_cache.move_pic_status){
                    if(!_cache.ctrls.close_btn.is(':hidden')){
                        _cache.ctrls.file_name.hide();
                        _cache.ctrls.close_btn.hide();
                        _cache.ctrls.pause_btn.hide();
                    }
                }
                else{
                    if(_cache.ctrls.close_btn.is(':hidden')){
                        _cache.ctrls.file_name.show();
                        _cache.ctrls.close_btn.show();
                        if(_sildeShowStatus){
                            _cache.ctrls.pause_btn.show();
                        }
                    }
                }
                listenName();
            });
        }
        _cache.ctrls.file_name.show();
        _cache.ctrls.close_btn.show();
        if(_sildeShowStatus){
            _cache.ctrls.pause_btn.show();
        }
        listenName();
        
        _cache.dom.removeClass('pvc-showlist');
        _cache.dom.find('[data-btn="file_list"]').removeAttr('is_show');
        _cache.dom.show();
        _cache.dom.find('[data-auto]').hide();
        window.setTimeout(function(){
            if(!_first){
                _first = true;
                _cache.dom.find('[data-auto]').fadeIn();
                window.setTimeout(function(){
                    if(!_showStatus['left']){
                        _cache.dom.find('[data-auto="left"]').stop().fadeOut(200);
                    }
                    if(!_showStatus['bottom']){
                        _cache.dom.find('[data-auto="bottom"]').stop().fadeOut(200);
                    }
                },1200);
            }
            var fa = _cache.dom.find('a:first');
            fa.focus();
            window.setTimeout(function(){
                fa.blur();
            }, 10);
        }, 1);
    }
    
    var _ctrlsTimer = {}, _first = false, _hideNameTimer;
    var listenName = function(){
        if(_hideNameTimer) window.clearTimeout(_hideNameTimer);
        _hideNameTimer = window.setTimeout(function(){
            !_cache.ctrls.file_name.is('hidden') && _cache.ctrls.file_name.hide();
            !_cache.ctrls.close_btn.is('hidden') && _cache.ctrls.close_btn.hide();
            !_cache.ctrls.pause_btn.is('hidden') && _cache.ctrls.pause_btn.hide();
            listenName();
        }, 5000);
    }
    
    var _showStatus = {};
    var clearCtrlsTimer = function(type){
        var hk = type + '_ht';
        var sk = type + '_st';
        if(_ctrlsTimer[hk]){
            window.clearTimeout(_ctrlsTimer[hk]);
        }
        if(_ctrlsTimer[sk]){
            window.clearTimeout(_ctrlsTimer[sk]);
        }
    }
    
    var showCtrls = function(type){
        if(_sildeShowStatus) return false;
        if(_showStatus[type]) return false;
        _showStatus[type] = true;
        var doms = _cache.dom.find('[data-auto="'+type+'"]');
        var sk = type + '_st';
        clearCtrlsTimer(type);
        _ctrlsTimer[sk] = window.setTimeout(function(){
            doms.stop().hide().fadeIn(100);
            if(type == 'bottom'){
                if(!_cache.dom.hasClass('pvc-showlist') && _cache.dom.find('[data-btn="file_list"]').attr('is_show') == '1'){
                    if(_cache.ctrls.min_pic.parent().is(':hidden')){
                        _cache.dom.addClass('pvc-showlist');
                    }
                }
            }
        }, 100);
        
    }
    
    var hideCtrls = function(type){
        if(_sildeShowStatus){
        }
        else{
            if(!_showStatus[type]) return false;
        }
        
        _showStatus[type] = false;
        var doms = _cache.dom.find('[data-auto="'+type+'"]');
        var hk = type + '_ht';
        clearCtrlsTimer(type);
        _ctrlsTimer[hk] = window.setTimeout(function(){
            doms.stop().fadeOut(300);
            if(type == 'bottom'){
                _cache.dom.removeClass('pvc-showlist');
            }
        }, 400);
        
    }

    var minFileList = {
        loadlist_status: false,
        bindEvents: function(){
            _cache.ctrls.file_list.delegate('[btn]', 'click', function(){
                var el = $(this);
                var parBox = minFileList.box.parent();
                var box = minFileList.box;
                var pw = parBox.width();
                var uw = box.children().length * 98;
                var of = box.offset().left - parBox.offset().left;
                
                switch(el.attr('btn')){
                    case 'prev':
                        if(of >= 0) return false;
                        
                        var ml = of + pw;
                        
                        if(ml >= 0) ml = 0;
                        
                        box.stop().animate({
                            left: ml
                        }, 300);
                        break;
                    case 'next':
                        if(uw - Math.abs(of) <= pw) return false;
                        var ml = of - pw;
                        if(Math.abs(ml) + pw > uw){
                            ml = ml + (pw + Math.abs(ml)) - uw;
                        }
                        box.stop().animate({
                            left: ml
                        }, 300);
                        break;
                }
                return false;
            });
        },
        _prepend: function(item, i){
            if(this.loadlist_status){
                var li = $(String.formatmodel('<li fid="{file_id}" ind="'+i+'" pc="{pick_code}"><a href="javascript:;"><img style="background:#fff;" src="{min_pic}" /></a></li>', item));
                this.box.preend(li);
                li.find('a').on('click', {
                    mode: item
                }, function(e){
                    if($(this).hasClass('current')) return false;
                    var mode = e.data.mode;
                    _cache.ac_info = mode;
                    loadPic();
                    return false;
                });
            }
        },
        _append: function(item, i){
            if(this.loadlist_status){
                var li = $(String.formatmodel('<li fid="{file_id}" ind="'+i+'" pc="{pick_code}"><a href="javascript:;"><img style="background:#fff;" src="{min_pic}" /></a></li>', item));
                this.box.append(li);
                li.find('a').on('click', {
                    mode: item
                }, function(e){
                    if($(this).hasClass('current')) return false;
                    var mode = e.data.mode;
                    _cache.ac_info = mode;
                    loadPic();
                    return false;
                });
            }
        },
        sortList: function(){
            if(minFileList.file_list && minFileList.file_list.length){
                for(var i = 0, len = minFileList.file_list.length; i < len; i++){
                    minFileList.file_list[i].ind = i;
                    this.box && this.box.find('li[fid="'+minFileList.file_list[i].file_id+'"]').attr('ind', i);
                }
            }
        },
        load: function(){
            if(!this.loadlist_status && this.file_list){
                if(!this.box){
                    this.box = _cache.ctrls.file_list.find('ul');
                    this.bindEvents();
                }
                this.box.html('');
                this.loadlist_status = true;
                //加载当页文件列表
                for(var i = 0, len = this.file_list.length; i < len; i++){
                    var item = this.file_list[i];
                    this._append(item, i);
                }
                this.focus();
            }
        },
        next: function(){
            if(minFileList.load_next_statue) return;
            minFileList.load_next_statue = true;
            var info = _cache.ac_info;
            
            var ind = info.ind + 1;
            if(ind < this.file_list.length && this.file_list[ind]){
                var acInfo = this.file_list[ind];
                _cache.ac_info = acInfo;
                loadPic();
            }
            else{
                if(VW.Screen.Actions && VW.Screen.Actions['next']){
                    fireAction('next', _cache.ac_info, function(r){
                        
                        if(r && r.length > 1){
                            var firstInd = -1;
                            for(var i = 1, len = r.length; i < len; i++){
                                var item = r[i];
                                var gind = minFileList.file_list.push(item);
                                gind--;
                                item.ind = gind;
                                minFileList._append(item, gind);
                                if(i == 1){
                                    firstInd = gind;
                                }
                            }
                            
                            var acInfo = minFileList.file_list[firstInd];
                            _cache.ac_info = acInfo;
                            loadPic();
                        }
                        else{
                            if(_sildeShowStatus){
                                ind = 0;
                                var acInfo = minFileList.file_list[ind];
                                _cache.ac_info = acInfo;
                                loadPic();
                            }
                            else{
                                minFileList.load_next_statue = false;
                                closeScreen();
                            }
                        }
                    });
                }
                else{
                    if(_sildeShowStatus){
                        ind = 0;
                        var acInfo = this.file_list[ind];
                        _cache.ac_info = acInfo;
                        loadPic();
                    }
                    else{
                        minFileList.load_next_statue = false;
                        closeScreen();
                    }
                }
            }
        },
        prev: function(){
            if(minFileList.load_next_statue) return;
            minFileList.load_next_statue = true;
            var info = _cache.ac_info;
            
            var ind = info.ind - 1;
            if(ind >= 0 && this.file_list[ind]){
                var acInfo = this.file_list[ind];
                _cache.ac_info = acInfo;
                loadPic();
            }
            else{
                if(VW.Screen.Actions && VW.Screen.Actions['prev']){
                    fireAction('prev', _cache.ac_info, function(r){
                        if(r && r.length > 1){
                            var firstInd = -1;
                            for(var i = r.length - 1; i > 0; i--){
                                var item = r[i];
                                var gind = minFileList.file_list.unshift(item);
                                
                                minFileList._prepend(item, gind);
                                if(i == r.length - 1){
                                    firstInd = r.length - 1;
                                }
                            }
                            var acInfo = minFileList.file_list[firstInd];
                            minFileList.sortList();
                            _cache.ac_info = acInfo;
                            loadPic();
                        }
                        else{
                            minFileList.load_next_statue = false;
                            closeScreen();
                        }
                    });
                }
                else{
                    minFileList.load_next_statue = false;
                    closeScreen();
                }
            }
        },
        del: function(info){
            if(this.file_list){
                if(this.file_list.length == 1){
                    closeScreen();
                }
                else{
                    var isNext = false;
                    var oldInd = info.ind;
                    if(info.ind < this.file_list.length - 1){
                        isNext = true;
                    }
                    this.file_list.splice(oldInd, 1);
                    if(!isNext){
                        oldInd--;
                    }
                    if(oldInd < 0){
                        oldInd = 0;
                    }
                    if(this.box){
                        this.box.find('[pc="'+info.pick_code+'"]').empty().remove();
                    }
                    
                    for(var i = oldInd, len = this.file_list.length; i < len; i++){
                        var item = this.file_list[i]
                        item['ind'] = i;
                        if(this.box){
                            this.box.find('[pc="'+item['pick_code']+'"]').attr('ind', item['ind']);
                        }
                    }
                    _cache.ac_info = this.file_list[oldInd];
                    loadPic();
                }
            }
        },
        focus: function(){
            var info = _cache.ac_info;
            if(info && this.box){
                var li = this.box.find('[pc="'+info.pick_code+'"]');
                var leftAdd = this.box.parent().offset().left;
                if(li.length){
                    this.box.find('.current').removeClass('current');
                    li.find('a').addClass('current');
                    
                    var ind = Number(li.attr('ind'));
                    
                    var liLeft = (ind + 1) * 98 - leftAdd;
                    
                    var parLeft = Math.abs(this.box.offset().left - leftAdd);
                    var parBox = this.box.parent();
                    var pW = parBox.width();
                    pW = pW - (pW % 98);
                    
                    //判断是否是要移动
                    if(liLeft > parLeft + 98 && liLeft < parLeft + pW - 98){
                    //Util.log('test: ' + liLeft + ' ' + parLeft + ' ' + (parLeft + pW));
                    }
                    else{
                        var ml;
                        if(liLeft <= parLeft + 98){
                            ml = liLeft - (li.width() + 20);
                            if(ml < 0) ml = 0;
                        }
                        else{
                            var uW = this.box.children().length * 98;
                            ml = (liLeft + leftAdd  + (li.width() + 20)) - pW ;
                            if(ml + pW > uW){
                                ml = uW - pW;
                            }
                        }
                        this.box.stop().animate({
                            left: -ml
                        }, 300);
                    }
                }
            }
        }
    }

    VW.Initial = function(){
        //Load css
        Util.Style.IncludeCss('js_viewer_css_' + _cssKey, '/invest/css/v2/zoom.css?v=' + (window['VIEWER_VERSION'] ? window['VIEWER_VERSION']  : '2.2'));
    }
    
    VW.Screen = {
        _showBtn: function(type){
            if(this.Actions && this.Actions[type]){
                _cache.dom.find('[data-btn="'+type+'"]').css({display:''});
            }
            else{
                _cache.dom.find('[data-btn="'+type+'"]').css({display:'none'});
            }
        },
        IsOpen: function(){
            return _cache.dom && !_cache.dom.is(':hidden');
        },
        Open: function(fileInfo, list, win){
            VW.Initial();
            _cache.ac_info = fileInfo;
            if(win) {
                _cache.win = win;
            }
            
            minFileList.file_list = list;
            minFileList.loadlist_status = false;
            ui();
            
            this._showBtn('star');
            this._showBtn('download');
            this._showBtn('share');
            this._showBtn('magic');
            this._showBtn('del');
            _cache.dom.find('[data-btn="source"]').hide();
            
            
            var showCount = 0;
            _cache.dom.find('[data-ui-rel="btn_box"] [data-btn]').each(function(){
                if($(this).css('display') != 'none'){
                    showCount++;
                }
            });
            if(showCount){
                _cache.dom.find('[data-ui-btn="more"]').show();
            }
            else{
                _cache.dom.find('[data-ui-btn="more"]').hide();
            }
            
            if(minFileList.box){
                minFileList.box.html('');
                minFileList.box.css({
                    left: ''
                });
            }
            loadPic();
            VW.IsOpenPic = true;
        },
        Actions: false
    }
})();