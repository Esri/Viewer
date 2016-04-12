Number.prototype.padLeft = function (n,str){
    return Array(n-String(this).length+1).join(str||'0')+this;
};

Date.prototype.getSQLDate = function() {
    if(this.toDateString() === "Invalid Date") {
        return null;
    }
    return this.getFullYear().padLeft(4)+(this.getMonth()+1).padLeft(2)+this.getDate().padLeft(2);
};
