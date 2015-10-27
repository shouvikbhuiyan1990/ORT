$(document).ready(function(){   
        var applicationContainer = "<div id='applicationCont'><label><input type='checkbox' class='checkbox-switch bigswitch' id='checkStatus'/><div><div></div></div></label><div class='comment-container grid-view'></div><div class='overlay-shim hide'></div><div class='overlay hide'><a class='close-link'></a><p class='overlay-msg'></p><div class='btn-container hide'><a href='javascript:void(0);' class='discard-confirm'>Ok</a><a href='javascript:void(0);' class='discard-cancel'>Cancel</a></div></div><div class='error-message hide'>All fields are mandatory.<span class='error-message-icon'></span></div></div>";
        $('body').append(applicationContainer)
        $('#checkStatus').click(function(){
            var $checkTarget = $(this);
            if($(this).is(':checked')){
                    var scriptTag = document.createElement("script");
                    scriptTag.type = "text/javascript";
                    scriptTag.src = "/review-tool/js/vendors/require/require.js";
                    scriptTag.setAttribute("data-main", "/review-tool/js/main");
                    scriptTag.setAttribute('id', 'addedScript');
                    ( document.getElementsByTagName("head")[0] || document.documentElement ).appendChild( scriptTag );
                    if(typeof(initializeReview) != 'undefined') {
                      initializeReview();
                    }
            }
            else{
                $('#addedScript').remove();
                $('#applicationCont').find('[data-tool="review"]').remove();    
                $('#applicationCont').find('[data-tool="comment"]').remove();
				$('#applicationCont').find('.highlighter-panel').remove();				
				$('.colorpicker').remove();	
            }
        });
});