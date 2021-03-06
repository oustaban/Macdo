function SignatureCapture( canvasID ) {
	this.touchSupported = Modernizr.touch;
	this.canvasID = canvasID;
	this.canvas = $("#"+canvasID);
	this.context = this.canvas.get(0).getContext("2d");	
	this.context.strokeStyle = "#000000";
	this.context.lineWidth = 1;
	this.lastMousePoint = {x:0, y:0};
	
	this.canvas[0].width = this.canvas.parent().innerWidth();
    
	if (this.touchSupported) {
		this.mouseDownEvent = "touchstart";
		this.mouseMoveEvent = "touchmove";
		this.mouseUpEvent = "touchend";
	}
	else {
		this.mouseDownEvent = "mousedown";
		this.mouseMoveEvent = "mousemove";
		this.mouseUpEvent = "mouseup";
	}
	
	this.canvas.bind( this.mouseDownEvent, this.onCanvasMouseDown() );
}

SignatureCapture.prototype.onCanvasMouseDown = function () {
	var self = this;
	return function(event) {
		self.mouseMoveHandler = self.onCanvasMouseMove()
		self.mouseUpHandler = self.onCanvasMouseUp()

		$(document).bind( self.mouseMoveEvent, self.mouseMoveHandler );
		$(document).bind( self.mouseUpEvent, self.mouseUpHandler );
		
		self.updateMousePosition( event );
		self.updateCanvas( event );
	}
}

SignatureCapture.prototype.onCanvasMouseMove = function () {
	var self = this;
	return function(event) {

		self.updateCanvas( event );
     	event.preventDefault();
    	return false;
	}
}

SignatureCapture.prototype.onCanvasMouseUp = function (event) {
	var self = this;
	return function(event) {

		$(document).unbind( self.mouseMoveEvent, self.mouseMoveHandler );
		$(document).unbind( self.mouseUpEvent, self.mouseUpHandler );
		
		self.mouseMoveHandler = null;
		self.mouseUpHandler = null;
	}
}

SignatureCapture.prototype.updateMousePosition = function (event) {
 	var target;
	if (this.touchSupported) {
		target = event.originalEvent.touches[0]
	}
	else {
		target = event;
	}

	var offset = this.canvas.offset();
	this.lastMousePoint.x = target.pageX - offset.left;
	this.lastMousePoint.y = target.pageY - offset.top;

}

SignatureCapture.prototype.updateCanvas = function (event) {

	this.context.beginPath();
	this.context.moveTo( this.lastMousePoint.x, this.lastMousePoint.y );
	this.updateMousePosition( event );
	this.context.lineTo( this.lastMousePoint.x, this.lastMousePoint.y );
	this.context.stroke();
}

SignatureCapture.prototype.toString = function () {

	var dataString = this.canvas.get(0).toDataURL("image/png");
	MM.log('DataString:'+dataString);
	var index = dataString.indexOf( "," )+1;
	dataString = dataString.substring( index );
	MM.log('DataString:'+dataString);
	
	return dataString;
}

SignatureCapture.prototype.clear = function () {

	var c = this.canvas[0];
	this.context.clearRect( 0, 0, c.width, c.height );
}

var Base64 = {


    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },


    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}

var sigCapture = null;

function signaturePopin( elem ) {

                                            //$("#signature").on(MM.clickType, function(e) {
                        
                                                MM.widgets.dialogClose();
                                                
                                                var timeSession = $(elem).attr("time");
                                                var course = $(elem).attr("course");
                                                var userid = $(elem).attr("userid");
                                                
												//var sigCapture = new SignatureCapture( "canvassignature" );
                                                
                                                MM.log('Signature : ' + timeSession + ',' + course + ',' + userid);
                                                
                                                var userP = MM.db.get('users', MM.config.current_site.id + "-" + userid);
                                                var userG = userP.toJSON();
                                                
                                                var addNote = "Valider";
                                                var html = '<div id="canvasContainer" style="background-color:#cccccc"><canvas id="canvassignature" name="canvassignature" height="200px" /></div><script>$(document).ready(function(e) { var sigCapture = new SignatureCapture( "canvassignature" ); });</script>';
                        
                                                var options = {
                                                    title: 'Signature de la session pour '+userG.fullname,
                                                    width: "90%",
                                                    buttons: {}
                                                };
                                                
                                                options.buttons[MM.lang.s("cancel")] = function() {
                                                    MM.Router.navigate("eleves/" + course );
                                                    MM.widgets.dialogClose();
                                                    $('#stopSessionL').click();
                                                };
                                                
                                                
                                                
                                                options.buttons["Effacer"] = function() {
                                                    //var sig2 = $('#canvassignature').get(0).toDataURL("image/png");
													var sig2 = new SignatureCapture( "canvassignature" );
                                                    sig2.clear();
													//sigCapture.clear();
                                                };
                                                
                                                options.buttons["Valider"] = function() {
                                                    //var sigCapture2 = new SignatureCapture( "canvassignature" );
													var sig = $('#canvassignature').get(0).toDataURL("image/png");
													//var index = sig.indexOf( "," )+1;
													//sig = sig.substring( index );
													
                                                    //var sigDec = Base64.decode(sig);
													//var sigData = "data:image/png;base64,"+sig;
                                                    var fileSignature = MM.config.current_site.id+"/"+course+"/result/"+userid+"_"+timeSession+".png";
													
													
                                                    //create local result file
                                                    MM.fs.createFile(fileSignature,
                                                        function(fileEntry) {
                                                            MM.fs.writeInFile(fileEntry, sig, 
                                                                function(fileUrl) {
                                                                    MM.log(' Write Signature OK : ' + fileUrl);
																	MM.Router.navigate("eleves/" + course );
																	MM.widgets.dialogClose();
																	$('#stopSessionL').click();
                                                                },
                                                                function(fileUrl) {
                                                                    MM.log(' Write Signature NOK : ' + fileUrl);
																	MM.Router.navigate("eleves/" + course );
																	MM.widgets.dialogClose();
																	$('#stopSessionL').click();
                                                                }
                                                            );
                                                        },
                                                        function(fileEntry) {
                                                            MM.log(' Write Signature NOK : ' + fileSignature);
															MM.Router.navigate("eleves/" + course );
															MM.widgets.dialogClose();
															$('#stopSessionL').click();
                                                        }
                                                    );
                                                                
                                                    
                                                };
                                                
                                                MM.widgets.dialog(html, options);
                                                
                                                
                                                $(document).ready(function(e) {     
                                                    var sigCapture = new SignatureCapture( "canvassignature" );
                                                });
                                                
}
			