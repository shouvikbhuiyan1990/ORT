var  reviewTool = window.reviewTool || {};
var postData, objIndex, positionData, responseObj;
var appContainer = $('#applicationCont');
var commentConatiner = $(".comment-container");
requirejs.config({

    baseUrl: '/review-tool/js/',
	
	paths: {
        'jquery': 'vendors/jquery/jquery',	
        'jqueryui': 'vendors/jqueryui/jquery-ui',  
        'excel' : 'vendors/excelExport/jquery.battatech.excelexport.min',
        'colorpicker' : 'vendors/colorpicker/colorpicker.min'
    }, //end of path

});

// Start the main app logic.
requirejs(['jquery','jqueryui','excel','colorpicker'],
	function(JQuery) {
    reviewTool.startPoint = ( function() {
            var appFunction,zIndexVal,dynamicId;
            var retrievedObject;
			zIndexVal=1000;
            initializeReview = function(){
                $.ajax({
                    url: "http://54.200.240.230/ort/getAllData",
                    type: "GET",
                    dataType:"json",
                    contentType:"application/json",
                    success:function(data){
                        retrievedObject = data;
                        console.log('retrieved data is ' + retrievedObject);
                    }
                });
                appFunction.loadPanel();
                appFunction.loadComments();
                appFunction.assignOverlay();
                $(appContainer).find('[data-tool="comment"]').show();
                $(appContainer).on('click','.add-icon', appFunction.addComment);
                $(appContainer).on('click','.save-button', appFunction.saveComment);
                $(appContainer).on('click','.save-icon',appFunction.saveData);
                $(appContainer).on('click','.maximize-btn, .minimize-btn', appFunction.toggleComment);
                $(appContainer).on('click','.cancel-button', appFunction.toggleComment);
				$(appContainer).on('click','.comment-header label',appFunction.changeRadio);
				$(appContainer).on('click','.grid-view .comment-box',appFunction.increaseZindex);
				$(appContainer).on('click','.cancel-icon',appFunction.cancelNewChanges);
				$(appContainer).on('click','.delete-btn',appFunction.deleteComment);
                $(appContainer).on('click','.list-icon',appFunction.listView);
                $(appContainer).on('click','.grid-icon',appFunction.gridView);
                $(appContainer).on('keyup','.comment-title',appFunction.updateTitle);
                $(appContainer).on('click','.btnExport',appFunction.exportExcel);
                $(appContainer).on('click','.close-link,.overlay-shim',appFunction.closeOverlay);
				$(appContainer).on('click','.highlighter',appFunction.addHighlighter);
                $(appContainer).on('click','.palette',appFunction.selectPalette);
				//$(appContainer).on('click','.grid-icon,.list-icon,.cancel-icon',appFunction.panelOptionSelect);
                $(appContainer).on('click','.error-message-icon',appFunction.closeErrorMessage);
				$(appContainer).on('click','.btn-container a',appFunction.discardChange);
				
            };

            appFunction =  {
                'loadPanel' : function(){
                        $.get("/review-tool/data/panel.html",function(data){
                            $(appContainer).append(data);
                            $(".panel-content").draggable({ cursor: 'move',containment: 'parent' });
                            if($(".comment-container").hasClass("grid-view")){
                                $('.grid-icon').addClass('disabled');
                            }else{
                                $('.list-icon').addClass('disabled');
                            }
                        });
                },
                'loadComments' :  function(){
                        var parseData;
                        $.ajax({
                            url: "http://54.200.240.230/ort/getAllData",
                            type: "GET",
                            dataType:"json",
                            contentType:"application/json",
                            success:function(data){
                                parseData = data;
                                appFunction.updateCommentData("comment-box",parseData,commentConatiner);
                            }
                        });
                        if(!parseData){
                            dynamicId=0;
                            //var parseData = JSON.parse(localStorage.dataObjkey);							
                            //appFunction.updateCommentData("comment-box",parseData,commentConatiner);
                        }   
						/*else
						{
							dynamicId=0;
						}*/
                },
                'addComment' :  function(e){
                    if($(".comment-container").hasClass("grid-view")){
                        $.get("/review-tool/data/panel-comment.html",function(data){
						var newData = $(data).attr('id','id-'+dynamicId);
                        $(newData).find(".comment-toolBox").append('<div class="colorselector"><div class="color-container" style="background-color: rgb(153, 141, 153);"></div><input type="text" readonly class="hex-input"></div>')
						$(newData).find("input[type='radio']").attr("name",'name'+dynamicId++);
						$(newData).find(".comment-header").css("border-top","3px solid #e43e42");
                            commentConatiner.append(newData);
                            $(".comment-box").draggable({cursor: 'move',containment: "document"});
                            appFunction.colorPalette();

                        });
                        e.stopImmediatePropagation();
                    }
                },
                'saveComment' :  function(e){
				        var targetElem = e.currentTarget;
        				if(appFunction.commentValidations($(targetElem).parents('.comment-box')) === "true") {
                            $(targetElem).parents('.comment-box').find(".blank-error").addClass("hide");
                            $(targetElem).parents('.comment-box').addClass("collapse").removeClass('expand');
                            var parentObj = $(targetElem).parents('.comment-box');
        					$(parentObj).removeClass('notValidate').addClass("validated");
							$(targetElem).parents('.comment-box').find(".comment-header .minimize-btn").removeClass("minimize-btn").addClass("maximize-btn");
                            appFunction.addStatus(parentObj);
							if($("#highlighter-"+$(parentObj).attr("id").split('-')[1]).length>=0) {
								$("#highlighter-"+$(parentObj).attr("id").split('-')[1]).addClass('hide-highlighter');
							}
    					} else {
                            $(targetElem).parents('.comment-box').removeClass("validated").addClass('notValidate');
    						$(targetElem).parents('.comment-box').find(".blank-error").removeClass("hide");
    					}
                        e.stopImmediatePropagation();
                },
                'saveData' :  function(e){
                        $(this).parents('li').siblings().find('a').removeClass('selected');
                        /*if($(".comment-box").length == 0){
                            return;
                        }*/
                        var responseObj = [];
                        var dataObj = {};
                        var flag = 0;
                        $('.comment-box').each(function(index){
                            if($(this).find('.comment-title').val() === "" || $(this).find('.assigned-by').val() === "" || $(this).find('.comment-summary').val() === "") {
                                $(this).removeClass('validated').addClass('notValidate');
                                $(this).find('.blank-error').removeClass('hide');
                                flag = 1;
                            }
                            else{
                                $(this).removeClass('notValidate').addClass('validated');
                                $(this).find('.blank-error').addClass('hide');
                                
                            }
                        });
						responseObj = appFunction.collectAllComments("validated");                        
						console.log(responseObj);

                        $('.comment-box').addClass("collapse").removeClass('expand');
						$('.highlighter-panel').addClass('hide-highlighter');
                        $('.comment-box').find(".comment-header .minimize-btn").removeClass("minimize-btn").addClass("maximize-btn");
                        if(flag === 0){
                            $.ajax({
                                    url: "http://54.200.240.230/ort/saveData",
                                    type: "POST",
                                    dataType:"json",
                                    data:responseObj,
                                    contentType:"application/json",
                                    success:function(data){
                                                    console.log(data)
                                    }
                            });

                            //localStorage.setItem("dataObjkey", JSON.stringify(responseObj));
                            appFunction.showOverlay("Data saved successfully !!");
                            $('.error-message').addClass('hide');
                        }
                        else{
                            $('.error-message').removeClass('hide');
                        }
						$('.comment-box').each(function( index ) {
							appFunction.addStatus($(this));
						});
                },
                'toggleComment' : function(e){                         
						parentObj = $(this).parents(".comment-box");
						var highlighterID=$(parentObj).attr('id').split('-')[1];
						if(!$(parentObj).hasClass('expand')) {
							$(".comment-box").removeClass('expand').addClass('collapse'); 
							$(parentObj).removeClass("collapse").addClass('expand');
							
							$(".comment-box").find(".comment-header .minimize-btn").addClass("maximize-btn").removeClass('minimize-btn');
							$(parentObj).find(".comment-header .maximize-btn").addClass('minimize-btn').removeClass('maximize-btn');
							$(".highlighter-panel").addClass('hide-highlighter');
							if($("#highlighter-"+highlighterID).length>=0) {
								$("#highlighter-"+highlighterID).removeClass('hide-highlighter');
							}
						}else {
							$(parentObj).removeClass('expand').addClass('collapse');
							$(parentObj).find(".comment-header .minimize-btn").addClass('maximize-btn').removeClass('minimize-btn');
							$(".highlighter-panel").addClass('hide-highlighter');
						}
						
						 $('.comment-box').each(function( index ) {
							appFunction.addStatus($(this));
						});
                        var targetElem = e.currentTarget;
                        if($(targetElem).hasClass('cancel-button')){
                            $(parentObj).find('.comment-title').val('');
                            $(parentObj).find('.assigned-by').val('');
                            $(parentObj).find('.comment-summary').val('');
							$(parentObj).find('.highlighter').removeClass('selected-tool');
							$(parentObj).find('.palette').removeClass('selected-tool');
							$(parentObj).find('.colorselector').hide();
                            $(parentObj).removeClass('validated');
							$("#highlighter-"+$(parentObj).attr('id').split('-')[1]).remove();
                        }
                        e.stopImmediatePropagation();
                },
				'changeRadio' : function() {
    					$(this).parents(".comment-header").find("label").removeClass("active");
    					$(this).parents(".comment-header").find("input[type='radio']").attr("checked",false);
    					$(this).addClass("active");
    					$(this).prev().attr("checked",true);
				},
				'increaseZindex' : function(e) {
    					if($(this).css("z-index") < zIndexVal) {
    						zIndexVal++;
    						$(this).css("z-index" , zIndexVal);
                            //return false;
                            e.stopImmediatePropagation();
    					}
				},
                'addStatus' : function(parentObj){
                        if($(parentObj).find(".comment-body").css("display")=="none") {
                            var borderColor=$(parentObj).find(".active").css("background-color");
                            $(parentObj).find(".comment-header").css("border-top","3px solid "+ borderColor);
                        }
                        else {
                            $(parentObj).find(".comment-header").css("border-top","none");
                        }
                },
				'commentValidations' : function(commentObj) {
    					var returnVal = "true";
    					if($(commentObj).find(".comment-title").val()==="" || $(commentObj).find(".assigned-by").val()==="" || $(commentObj).find(".comment-summary").val()==="") {
    						returnVal = "false";
    					}
    					return returnVal;
				},
				'cancelNewChanges' : function() {
						appFunction.showOverlay("Do you want to discard changes?");
						$(".btn-container").removeClass('hide');

    					
				},
				'deleteComment' : function() {
					   $(this).parents(".comment-box").remove();
					   $("#highlighter-"+$(this).parents(".comment-box").attr("id").split('-')[1]).remove();
				},
				'collectAllComments' : function(classname) {
					var responseObj = [];


                     if($(".comment-container").hasClass("grid-view")){
                            $('.'+classname).each(function( index ) {
                                      var boxOffset = $(this).offset();
                                      dataObj ={};
                                      dataObj.id = $(this).attr("id").split("-")[1] ;
                                      dataObj.status = $(this).find(".active").attr('for');
                                      dataObj.title = $(this).find('.comment-title').val();
                                      dataObj.positionX = boxOffset.left;
                                      dataObj.positionY = boxOffset.top;
                                      dataObj.assignedBy = $(this).find('.assigned-by').val();
                                      dataObj.comment = $(this).find('.comment-summary').val();
									  if($("#highlighter-"+dataObj.id).length>0) {
    										dataObj.highlighterPosX = $("#highlighter-"+dataObj.id).offset().left;
    										dataObj.highlighterPosY = $("#highlighter-"+dataObj.id).offset().top;
    										dataObj.highlighterHeight = $("#highlighter-"+dataObj.id).height();
    										dataObj.highlighterWidth =  $("#highlighter-"+dataObj.id).width();
									  }
                                      if($(this).find('.palette').hasClass('selected-tool')){
                                            dataObj.colorPalette = $(this).find('.color-container').css("background-color");
                                            dataObj.colorhex = $(this).find('.colorselector input').val();
                                      }
                                      responseObj[index] = dataObj;
                                      var borderColor = $(this).find(".active").css("background-color");
                                      $(this).find(".comment-header").css("border-top","3px solid "+ borderColor);
                            });
                     } 
                     else {
                            $('.'+classname).each(function(i){
                                      var currentTargetElem = $("#"+$(this).attr('id'));
                                      dataObj ={};
                                      dataObj.id = $(currentTargetElem).attr("id").split("-")[1] ;
                                      dataObj.status = $(currentTargetElem).find(".active").attr('for');
                                      dataObj.title = $(currentTargetElem).find('.comment-title').val();
                                      dataObj.assignedBy = $(currentTargetElem).find('.assigned-by').val();
                                      dataObj.comment = $(currentTargetElem).find('.comment-summary').val();
									  if($("#highlighter-"+dataObj.id).length>0) {
    										dataObj.highlighterPosX = $("#highlighter-"+dataObj.id).offset().left;
    										dataObj.highlighterPosY = $("#highlighter-"+dataObj.id).offset().top;
    										dataObj.highlighterHeight = $("#highlighter-"+dataObj.id).height();
    										dataObj.highlighterWidth =  $("#highlighter-"+dataObj.id).width();
									  }
                                      if($(this).find('.palette').hasClass('selected-tool')){
                                            dataObj.colorPalette = $(currentTargetElem).find('.color-container').css("background-color");
                                            dataObj.colorhex = $(currentTargetElem).find('.colorselector input').val();
                                      }
                                      dataObj.positionX = positionData[dataObj.id].split(',')[0];
                                      dataObj.positionY = positionData[dataObj.id].split(',')[1];
                                      responseObj[i] = dataObj;
                                      var borderColor = $(currentTargetElem).find(".active").css("background-color");
                                      $(currentTargetElem).find(".comment-header").css("border-top","3px solid "+ borderColor);
                            });
                     }
						return responseObj;
				},
                'listView' : function(e){
                    if(!$(".comment-container").hasClass("list-view")){
                        $('.list-icon').addClass('disabled');
                        $('.grid-icon').removeClass('disabled');
                        positionData = appFunction.commentsPosition("comment-box");
                        $(".comment-container").addClass("list-view").removeClass("grid-view");
                        $(".comment-container").find(".heading").removeClass("hide");
                        $(".comment-box").css({'left' : '0px','top' : '0px'}).addClass("collapse").removeClass('expand');
						$(".highlighter-panel").addClass('hide-highlighter');
						$('.comment-box').find(".comment-header .minimize-btn").removeClass("minimize-btn").addClass("maximize-btn");
                        $(".comment-box").draggable('destroy');
                        $(".add-icon").addClass("list");

                        $('.comment-box').each(function(index){
                            var borderColor = $(this).find(".active").css("background-color");
                            $(this).find(".comment-header").css("border-top","3px solid "+ borderColor);
                        });
                    }
                    else{
                        e.preventDefault();
                    }
                },
                'gridView' : function(e){
                    if(!$(".comment-container").hasClass("grid-view")){
                        $('.grid-icon').addClass('disabled');
                        $('.list-icon').removeClass('disabled');
                        $(positionData).each(function(i,value){
						if($(positionData)[i]!==undefined)
                            $("#id-"+i).css({'left' : positionData[i].split(',')[0]+'px','top' : positionData[i].split(',')[1]+'px'});
                        });  
                        $(".comment-container").removeClass("list-view").addClass("grid-view");
                        $(".comment-container").find(".heading").addClass("hide");                        
                        $(".comment-box").draggable({cursor: 'move',containment: "document"});
                        $(".add-icon").removeClass("list");
                    }
                    else{
                        e.preventDefault();
                    }
                },
                'commentsPosition' : function(classname){
                    var positionObj = [];
                    $('.'+classname).each(function( index ) {
                          var boxOffset = $(this).offset();
                          dataObj ={};
                          positionObj[$(this).attr("id").split("-")[1]]=boxOffset.left+","+boxOffset.top;
                    });
                    return positionObj;
                },
                'updateCommentData' : function(classname,parseData,containerId){
                    dynamicId=parseData.length;
                    for(objIndex=0; objIndex< parseData.length; objIndex++) {
                        //$(panelData).find(".comment-toolBox").append('<div class="colorselector colorselector-'+dynamicId +'"><div class="color-container" style="background-color: rgb(153, 141, 153);"></div><input type="text" readonly></div>')
                        $(containerId).append(panelData);
                        //appFunction.colorPalette();
                        if(classname === "comment-box"){
                            $(".comment-box").draggable({cursor: 'move',containment: "document"});
                        }
                    }
                    $('.'+classname).each(function(index) {
                        $(this).find(".comment-toolBox").append('<div class="colorselector"><div class="color-container" style="background-color: rgb(153, 141, 153);"></div><input type="text" readonly class="hex-input"></div>')
                        appFunction.colorPalette();
                        $(this).addClass("validated old-comment");
                        $(this).attr("id","id-"+parseData[index].id);
                        //$(this).find('colorselector').addClass('colorselector' + index);
                        $(this).find("input[type='radio']").attr("name",'name'+parseData[index].id);
                        $(this).find('.comment-title').val(parseData[index].title);
                        $(this).find('.heading').text(parseData[index].title);
                        $(this).find('.assigned-by').val(parseData[index].assignedBy);
                        $(this).find('.comment-summary').val(parseData[index].comment);
                        $(this).css({'left':parseData[index].positionX + "px", 'top': parseData[index].positionY + "px"})
						$(this).find(".radiogroup input[type='radio']").attr('checked', false);
						$(this).find(".radiogroup label").removeClass("active");
                        $(this).find("#" + parseData[index].status).attr('checked', true);
                        $(this).find("#" + parseData[index].status + "-label").addClass('active');
                        $(this).find('.color-container').css("background-color", parseData[index].colorPalette)
                        $(this).find('.colorselector input').val(parseData[index].colorhex)
                        var borderColor=$(this).find(".active").css("background-color");
                        $(this).find(".comment-header").css("border-top","3px solid "+ borderColor);
						if(parseData[index].highlighterPosX!=null)
						{
							$(this).find(".highlighter").addClass('selected-tool');
							var highlighterData = "<div  id='highlighter-"+parseData[index].id+"' class='highlighter-panel hide-highlighter' ></div>";
							$(appContainer).append(highlighterData);
							$(".highlighter-panel").draggable({cancel: '',cursor: 'move',containment: "document"}).resizable();
							$("#highlighter-"+parseData[index].id).css({'left':parseData[index].highlighterPosX + "px", 'top': parseData[index].highlighterPosY + "px"});
							$("#highlighter-"+parseData[index].id).css({'height':parseData[index].highlighterHeight,'width':parseData[index].highlighterWidth});
						}
                        if(parseData[index].colorPalette!=null){
                            $(this).find('.palette').addClass('selected-tool');
                            $(this).find('.colorselector').show();
                        }
                    });
                },
                'updateTitle' : function(){
                    $(this).parents(".comment-box ").find("span.heading").text($(this).val());
                },
                'exportExcel' : function(){
                    $(this).parents('li').siblings().find('a').removeClass('selected');                    
                    responseObj = appFunction.collectAllComments("comment-box");     
                    var Title= document.title;
                    var uri = $("#dvjson").battatech_excelexport({
                          containerid: "dvjson"
                        , datatype: 'json'
                        , dataset: responseObj
                        , returnUri: true
                        , columns: [
                            { headertext: "Comment Title", datatype: "string", datafield: "title", width: "200px" }
                            , { headertext: "Assigned By", datatype: "string", datafield: "assignedBy", ishidden: false, width: "200px" }
                            , { headertext: "Comment Summary", datatype: "string", datafield: "comment", ishidden: false, width: "400px" }
                            , { headertext: "Status", datatype: "string", datafield: "status", ishidden: false, width: "150px" }
                        ]
                    });
                    $(this).attr('download', Title+'.xls').attr('href', uri).attr('target', '_blank');
                   
                },
                'colorPalette' : function(){

                        $('.colorselector').ColorPicker({
                                    color: '#EFEFEF',
                                    onShow: function (colpkr) {
                                        $(colpkr).fadeIn(500);
                                        return false;
                                    },
                                    onHide: function (colpkr) {
                                        $(colpkr).fadeOut(500);
                                        return false;
                                    },
                                    onChange: function (hsb, hex, rgb) {
                                        $(this).find('> div').css('backgroundColor', '#' + hex);
                                        var hexValue = $(this).find('#hex').val();
                                        var divIndex = $("div.colorpicker").index( this );
                                        $(appContainer).find(".comment-container #id-"+divIndex).find('div.color-container').css('background','#'+hexValue);
                                        $(appContainer).find(".comment-container #id-"+divIndex).find('input.hex-input').val('#'+hexValue);
                                    }
                            });
                },
				'assignOverlay' : function(){
                    var viewPortWidth = $(window).width();
                    var viewPortHeight = $(window).height();
                    $(".overlay-shim").css({'width' : viewPortWidth+'px','height' : viewPortHeight+'px'});
                    $(".overlay").css({'left':(viewPortWidth-($(".overlay").width()))/2+'px','top':(viewPortHeight-($(".overlay").height()))/2+'px'});
                },
                'showOverlay' : function(displayText){
                    $(".overlay p").text(displayText);
                    $(".overlay,.overlay-shim").removeClass('hide');
                },
                'closeOverlay' : function(){
                    $(".overlay,.overlay-shim").addClass("hide");
                },
				'addHighlighter' : function(){
					var id=$(this).parents('.comment-box').attr("id").split('-')[1];
					var highlighterData = "<div  id='highlighter-"+id+"' class='highlighter-panel' ></div>";
                    if(!$(this).hasClass('selected-tool')){
                        if($('#highlighter-'+id).length<=0){
							$(this).addClass('selected-tool');
                            $(appContainer).append(highlighterData);
                            $(".highlighter-panel").draggable({cancel: '',cursor: 'move',containment: "document"}).resizable();
                        }
                    }
                    else{
                        $('#highlighter-'+id).remove();
						$(this).removeClass('selected-tool')
                    }
					
				},
                'selectPalette': function(){
                    if(!$(this).hasClass('selected-tool')){
                        $(this).siblings('.colorselector').show();
						$(this).addClass('selected-tool');
                    }
                    else{
                        $(this).siblings('.colorselector').hide();
						$(this).removeClass('selected-tool')
                    }
                },
				/*'panelOptionSelect' : function(){
                    $(this).parents('li').siblings().find('a').removeClass('selected');
                    $(this).addClass('selected');
                },*/
				'selectHighlighter': function(){
                    if($(this).is(':checked')){
                        $(this).siblings('.colorselector').show();
                    }
                    else{
                        $(this).siblings('.colorselector').hide();
                    }
                },
                'closeErrorMessage' : function(){
                    $('.error-message').addClass('hide');
                },
				'discardChange' : function() {
					if($(this).hasClass('discard-confirm')) {
						$("#applicationCont .comment-box").remove();
						$("#applicationCont .highlighter-panel").remove();
						$(".comment-container").removeClass('list-view').addClass('grid-view');
						$('.list-icon').removeClass('disabled');
                        $('.grid-icon').addClass('disabled');
						$('.overlay,.overlay-shim').addClass('hide');
						$(".btn-container").addClass('hide');
						appFunction.loadComments();
					}
					else {
						$('.overlay,.overlay-shim').addClass('hide');						
					}
				}
            };
             initializeReview();
    }());

	}
);
var panelData =  "<div class='comment-box collapse' data-tool='comment'><div class='comment-header'><span class='maximize-btn'></span><span class='heading hide' title='List title'></span><span class='error-icon'></span><div class='radiogroup'><input type='radio' id='open' value='open' name='status' checked='true'/><label for='open' id='open-label' title='Status: Open' class='active'></label><input type='radio' id='inprogress' value='inprogress' name='status'/><label for='inprogress' id='inprogress-label' title='Status: In Progress'></label><input type='radio' id='fixed' value='fixed' name='status'/><label for='fixed' id='fixed-label' title='Status: Fixed'></label><input type='radio' id='closed' value='closed' name='status'/><label for='closed' id='closed-label' title='Status: Closed'></label></div><span class='delete-btn'></span></div><div class='comment-body'><p class='blank-error hide'>All fields are mandatory.</p><div class='input-wrapper'><label>Title</label><input type='text' class='comment-title' /></div><div class='input-wrapper'><label>Assigned By</label><input type='text' class='assigned-by'/></div><div class='input-wrapper'><label>Comment</label><textarea class='comment-summary'></textarea></div><div class='addon-tool'><label title='Select highlighter' class='highlighter'></label></div><div class='comment-toolBox'><label title='Select Color' class='palette'></label></div><div class='comment-btn-container'><a href='javascript:void(0);' class='save-button'>Ok</a><a href='javascript:void(0);' class='cancel-button'>Cancel</a></div></div></div>";




