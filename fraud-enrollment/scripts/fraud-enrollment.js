var discover = window.discover || {};

var util, phoneNum,
customlabel= $('.fraud-state-two #custom-label')


discover.fraud = ( function() {
    var appFunction;  

    init  = function() {
        
        util.customCheckbox("enrollToFraudIntercept");
		appFunction.accessibilityFocus();
        $('input[name="enrollToFraudIntercept"]').css('visibility','visible');

        $('.edit-btn').on('click', appFunction.showInputField);
        $('.cancel-btn').on('click', appFunction.hideInputField);
        $('.save-btn').on('click', appFunction.saveField);
        $('.terms-condition').on('click', appFunction.termsCondition);
        $('.continue-btn').on('click', appFunction.continueFunc)
        
        if($('input[name="enrollToFraudIntercept"]').is(':checked')){
            $('input[name="enrollToFraudIntercept"]').attr('aria-checked', 'true');
        }
        else{
            $('input[name="enrollToFraudIntercept"]').attr('aria-checked', 'false');
        }
    };
    util = {
        'customCheckbox' : function(checkboxName){
            var checkBox = $('input[name="'+ checkboxName +'"]');
            $(checkBox).each(function(){
                $(this).wrap( "<span class='custom-checkbox'></span>" );
                if($(this).is(':checked')){
                    $(this).parent().addClass("selected");
                }
            });
            $(checkBox).click(function(){
                var $checkTarget = $(this);
                util.checkBoxToggle($checkTarget);
            });

            $(checkBox).keypress(function(event) {
                    var keycode = (event.keyCode ? event.keyCode : event.which);
                    if (keycode == 13) {
                        var $checkTarget = $(this);
                        util.checkBoxToggle($checkTarget);
                    }   
                    event.stopPropagation();
            });
        },
        'checkBoxToggle': function(elem){
               $(elem).parent().toggleClass("selected");
               if ( $(elem).parent().hasClass("selected")) {
                    $('input[name="enrollToFraudIntercept"]').prop( "checked", true );
                    $('input[name="enrollToFraudIntercept"]').attr('aria-checked', 'true');
                }
                else{
                    $('input[name="enrollToFraudIntercept"]').prop( "checked", false );
                    $('input[name="enrollToFraudIntercept"]').attr('aria-checked', 'false');
                }
        },
        'next':function(i){
            return function(e) {
                //phoneNum[i].value=phoneNum[i].value.replace(/[^0-9]/g, "");
                e = (e) ? e : window.event;
                var charCode = (e.which) ? e.which : e.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                    $('.error-phone').show();
                    return false;
                }
                $('.error-phone').hide();
                return true;
                if(phoneNum[i].value.length==phoneNum[i].size - 1 && i<phoneNum.length) {
                    if(e.keyCode == 16 ){
                        if (i ==0) {
                            $("input[name='mobileAreaCode']").focus();
                        }
                        else{
                            phoneNum[i-1].focus();
                        }
                        
                    }
                    else{
                        //if (i != 2) phoneNum[i+1].focus();
                        $(phoneNum[i]).removeClass('error');
                        if (!$('.ph-number').hasClass('error')) {
                            $('.error-phone').hide();
                            $(customlabel).removeClass('labelPos').addClass('labelTop');
                        };
                    }
                }
            }
        },
        'back': function(i){
            /*return function(e) {
                if(e.keyCode == 8 && i>0) phoneNum[i-1].focus();
            }*/
        },
        'validatePhoneNumber': function(elementValue){
            var phoneNumberPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;  
            return phoneNumberPattern.test(elementValue); 
        },
        'printPopup': function(data){
            var mywindow = window.open('', '', 'height=400,width=600');
            mywindow.document.write('<html><head><title></title>');
            mywindow.document.write('</head><body>');
            mywindow.document.write(data);
			var printBtn = mywindow.document.getElementById("print-btn");
			printBtn.style.visibility = "hidden";
            mywindow.document.write('</body></html>');
            mywindow.document.close();
            mywindow.focus();
            mywindow.print();
            mywindow.close();
			printBtn.style.visibility = "visible";
            return true;
        }   
    };
    appFunction = {
        'showInputField' : function() {
            $('.fraud-inner-content').addClass('edit-number')
            $(customlabel).addClass('labelTop');
            $("input[name='mobileAreaCode']").focus();   
            $('.continue-btn').addClass('grey-button');

        },
        'hideInputField' : function() {
            $('.fraud-inner-content').removeClass('edit-number')
            $(customlabel).removeClass('labelPos labelTop');
            $('.continue-btn').removeClass('grey-button');
            $('.error-phone').hide();
            $('.ph-number').val('').removeClass('error');
            $(".edit-btn").focus();
        },
        'saveField' : function() {
            var phoneValid = $('.input-block-1').val() + '-' +$('.input-block-2').val() +'-'+ $('.input-block-3').val();
            if(util.validatePhoneNumber(phoneValid)){
                    $('.ph-number').removeClass('error');
                    $(customlabel).removeClass('labelPos labelTop');
                    $('.continue-btn').removeClass('grey-button');
                    $('.error-phone').hide();
                    for(i=1; i<4; i++){
                        var inputVal = $('.input-block-' + i).val();
                        $('.phone-number .number-block-'+ i).html(inputVal);
                    }
                    $('.fraud-inner-content').removeClass('edit-number');
					appFunction.submitForm("updateMobile");
            }
            else{
                    $('.ph-number').addClass('error');
                    $(customlabel).removeClass('labelTop').addClass('labelPos');
                    $('.error-phone').css('display','block');
            }
        },
        'termsCondition': function(){
			$(this).addClass("overlay-open");
			var elementClicked = $(this).attr('rel');
            var elementData = $('#'+elementClicked+'').html();
            $(".fraud-alert-overlay").html(elementData);
            var overlayHeight = $(".fraud-alert-lightBox").height();
            var overlayWidth = $(".fraud-alert-lightBox").width();

            $(".fraud-alert-lightBox").css({
				top : 100,
				left : ($(".content").width()/2) - (overlayWidth/2)
            });

            $(".fraud-alert-black-overlay").show();
            $(".fraud-alert-lightBox").show();
			$(".lightbox-inner .fraud-alert-overlay h3").attr("tabindex","0").focus();
            $(".fraud-alert-overlay").append('<a href="javascript:void(0);" class="accessibility-anchor"></a>');
        },
        'continueFunc': function(e){
            if($('.continue-btn').hasClass('grey-button')){
                e.preventDefault();
            }else{
				appFunction.submitForm("fraudInterceptForm");
			}
        },
		'accessibilityFocus': function(){
			$(document).on("focus",".accessibility-anchor",function(){
				$(this).parents(".fraud-alert-overlay").siblings().focus();
			});
		},
		'submitForm': function(formName){
			if(formName === "fraudInterceptForm"){
				$("form").attr("action","/cardmembersvcs/personalprofile/pp/EnrollAlert");
				$("form").submit();
			}else{
				$("form").attr("action","/cardmembersvcs/personalprofile/pp/UpdateMobile");
				$("form").submit();
			}
		}
    };
    $(document).ready(function () {
		init();
		phoneNum=document.getElementById("phones").getElementsByTagName("input");
		for(var i=0; i<phoneNum.length; i++) {
			phoneNum[i].onkeypress=util.next(i);
			//phoneNum[i].onkeydown=util.back(i);
		}
    });
}());


$(".close-btn").on('click',function(e) {
		$(".fraud-alert-black-overlay").hide();
		$(".fraud-alert-lightBox").hide();
		$(".fraud-alert-overlay").html('');
		$(".overlay-open").focus();
		$(document).find(".overlay-open").removeClass("overlay-open");
});

$('input[name="enrollToFraudIntercept"]').focus(function() {
    $('.custom-checkbox').css('outline','1px dotted');
}).blur(function() {
    $('.custom-checkbox').css('outline','none');
});

