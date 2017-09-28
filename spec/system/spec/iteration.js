describe("The iteration statement", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  describe("while", function() {
    
    it("doesn't execute if its condition is falsy", function() {
      expect(interpreter.program(
        "var a=1;" +
        "while(false){" +
          "a=0;" +
        "}" +
        "return a;")).toBe(1);
    });
    
    it("can loop", function() {
      expect(interpreter.program(
        "var a=[]," +
        "i=0;" +
        "while(i<2){" +
          "a.push(i++);" +
        "}" +
        "return a;")).toEqual([0, 1]);
    });
    
    it("can cause an early return", function() {
      expect(interpreter.program(
        "var i=0;" +
        "while(i++<1){" +
          "return 1;" +
        "}" +
        "return 0;")).toBe(1);
    });
    
  });
  
});
