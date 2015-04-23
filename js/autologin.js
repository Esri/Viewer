require(["esri/IdentityManager"], function (esriId) {
	var username = "";
	var password = "";
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
