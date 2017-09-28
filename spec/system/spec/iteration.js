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
  
  describe("for in", function() {
    
    it("doesn't iterate if the object has no properties", function() {
      expect(interpreter.program(
        "var a=1," +
        "o=Object.create(null);" +
        "for(var v in o){" +
          "a=0;" +
        "}" +
        "return a;", window)).toBe(1);
    });
    
    it("doesn't iterate if the object has no properties", function() {
      expect(interpreter.program(
        "var a=[]," +
        "o={" +
          "a:1," +
          "b:2" +
        "};" +
        "for(var pName in o){" +
          "if(o.hasOwnProperty(pName)){" +
            "a.push(pName);" +
          "}" +
        "}" +
        "return a;")).toEqual(["a", "b"]);
    });
    
    it("may cause an early return", function() {
      expect(interpreter.program(
        "var o={" +
          "a:1" +
        "};" +
        "for(var pName in o){" +
          "return 1;" +
        "}" +
        "return 0;")).toBe(1);
    });
    
  });
  
  describe("for(var i;;)", function() {
    
    it("may iterate zero times", function() {
      expect(interpreter.program(
        "var a=1;" +
        "for(var i=0;i<0;i++){" +
          "a=0;" +
        "}" +
        "return a;")).toBe(1);
    });
    
    it("may iterate many times", function() {
      expect(interpreter.program(
        "var f=1;" +
        "for(var i=1;i<4;i++){" +
          "f=f*i;" +
        "}" +
        "return f;")).toBe(6);
    });
    
    it("may cause an early return", function() {
      expect(interpreter.program(
        "for(var i=1;i<4;i++){" +
          "return 1;" +
        "}" +
        "return 0;")).toBe(1);
    });
    
  });
  
});
