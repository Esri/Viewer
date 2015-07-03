require(["esri/IdentityManager"], function (esriId) {
	var username = "htudosietsg";
	var password = "Margot!1";
	esriId.on("dialog-create", function(evt) {
		evt.target.dialog.txtUser_.focusNode.value = username;
		setTimeout(function() {
			evt.target.dialog.txtPwd_.focusNode.value = password;
			setTimeout(function() {
				evt.target.dialog.btnSubmit_.focusNode.click();
			}, 100);
		}, 100);
	});
});
