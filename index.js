Router.route("/ar/index", {
    name: "arTemplate",
    data: function() 
    {
        Session.set("selectedLayout", "cms");
    }
});

Router.route("/ar/index/:idCmsSection", {
    name: "arWithDataTemplate",
    data: function () {
        return this.params.idCmsSection;
    }
});
