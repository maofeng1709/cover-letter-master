$(function(){
	today = new Date();
	day = today.getDate();
	month = today.getMonth() + 1;
	year = today.getFullYear();
	$("#date").text(year + '-' + month + '-' + day);

	form_input_array = ['name', 'email', 'phone', 'address_1', 'postcode_1', 'city_1', 'destination', 'title', 'address_2', 'postcode_2', 'city_2'];
	letter_content_array = ['saluation', 'opening', 'forward_match', 'backward_match', 'closing', 'signature'];


	$("#info_form").on('blur', 'input', function(){
		var input_id = $(this).attr('id');
		var target_id_in_header = input_id.substring(5);
		var target_class_in_content = input_id.substring(5) + '-ref';

		if (target_id_in_header.startsWith('postcode') || target_id_in_header.startsWith('city')) {
			var index = input_id.slice(-1);
			$('#postcode_city_'+index).text($('#form_postcode_'+index).val() + ', ' + $('#form_city_'+index).val());	
		} else {
			$('#'+target_id_in_header).text($(this).val());
			$('.'+target_class_in_content).text($(this).val());
		}

	});


	$("#generate_pdf").on("click", function(){
		var opt = {
			margin:       0.8,
			filename:     'cover_letter.pdf',
			image:        {type: 'jpeg', quality:1},
			html2canvas:  { scale: 2},
			jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
		};
		var to_save = $("#cover_letter").clone();
		to_save.find('span').removeAttr("class");
		pdf = html2pdf().from(to_save[0]).set(opt);
		pdf.save();
	});

	$("#save_template").on("click", function(){
		var obj = {};
		for (var i = 0; i < form_input_array.length; i++) {
			var key = form_input_array[i];
			obj[key] = $('#form_'+key).val();
		}
		for (var i = 0; i < letter_content_array.length; i++) {
			var key = letter_content_array[i];
			obj[key] = $('tr.'+key).find('td').html();
		}

		var file_name = obj.name + ' - ' + obj.destination + ' - ' + obj.title;
		// generate json file and download
		var data = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
		var download_btn= document.createElement('a');
		download_btn.setAttribute("href", data);
		download_btn.setAttribute("download",  file_name + ".json");
		document.body.appendChild(download_btn); // required for firefox
		download_btn.click();
		download_btn.remove();
	});

	$('#select_template').on("click", function(){
		$('#template_input').click();
	});
	$('#template_input').on("change", function(){
		var reader = new FileReader();

		reader.onload = function(event) {
			var obj = JSON.parse(event.target.result);
			for (var i=0; i < form_input_array.length; i++) {
				var key = form_input_array[i];
				$('#form_'+key).val(obj[key]);
				if (key.startsWith("postcode") || key.startsWith("city")) {
					var index = key.slice(-1);
					$('#postcode_city_'+index).text(obj['postcode_'+index] + ', ' + obj['city_'+index]);	
				} else {
					$('#'+key).text(obj[key]);
				}
			}
			for (var i = 0; i < letter_content_array.length; i++) {
				var key = letter_content_array[i];
				$('tr.'+key).find('td').html(obj[key]);
			}
			$('#template_input').val(""); // in case upload same file, still fire change event
		}

		reader.readAsText(event.target.files[0]);
	});

	function add_ref (str, type, content) {
		var new_content = "";		
		var re = new RegExp("(?<=\\s|^|&nbsp;|<br>)"+str, "gi");
		var result;
		var start = re.lastIndex; // start = 0
		while (result = re.exec(content)) {
			new_content += content.slice(start, result.index) + "<span class='" + type + "-ref'>" + str + "</span>";
			start = re.lastIndex;
		}
		new_content += content.slice(start);
		return new_content;
	}

	function clean_ref (str, type, content) {
		var new_content = "";		
		var re = new RegExp("<span class=('|\")" + type + "-ref('|\")>.*?</span>", "gi");
		var pre_len = ("<span class='" + type + "-ref'>").length;
		var post_len = "</span>".length;
		var result;
		var start = re.lastIndex; // start = 0
		while (result = re.exec(content)) {
			var matched_str = result[0];
			var target = matched_str.slice(pre_len, matched_str.length - post_len);
			if (str != target) {
				new_content += content.slice(start, result.index) + target;	
				start = re.lastIndex;
			}
		}	
		new_content += content.slice(start);
		return new_content;
	}


	$('tr.letter-content').on('blur', 'td', function(){
		var destination = $('#form_destination').val();
		var title = $('#form_title').val();
		var content = $(this).html();

		if (destination) {
			content = add_ref(destination, 'destination', content);
			content = clean_ref(destination, 'destination', content);
		}

		if (title) {
			content = add_ref(title, 'title', content);
			content = clean_ref(title, 'title', content);
		}

		$(this).html(content);
	});

});
