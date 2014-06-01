/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function() {
		
		$('#myTab a').click(function (e) {
		  e.preventDefault()
		  $(this).tab('show')
		})
                if($('#teacher').is(':checked')) {
                   $('#classname').show();
                   $('#classid').hide();
               }
               if($('#learner').is(':checked')) {
                   $('#classname').hide();
                   $('#classid').show();
               }
	});
	 $(document).ready(function() {
          $("#chatblock").hide();
        });
        $("input:radio[name='type']").on('change',function() {
               if($('#teacher').is(':checked')) {
                   $('#classname').show();
                   $('#classid').hide();
               }
               if($('#learner').is(':checked')) {
                   $('#classname').hide();
                   $('#classid').show();
               }
});
$('#loginSubmit').click(function() {
               if($('#teacher').is(':checked')) {
                   var url = "/teacher/"+ $('#classname').val()+"/"+$('#name').val();    
                    $(location).attr('href',url);
               }
               if($('#learner').is(':checked')) {
                   var url = "/student/"+ $('#classid').val()+"/"+$('#name').val();   
                   $(location).attr('href',url);
               }
});
        $( "#id_profile" ).click(function() {
            $("#block").hide();
            $(this).addClass("active");
            $("#id_home").removeClass("active");
            $("#chatblock").show();
       });

      $( "#id_home" ).click(function() {
            $("#block").show();
            $(this).addClass("active");
            $("#id_profile").removeClass("active");
            $("#chatblock").hide();
      });
