describe("The operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("delete removes things from things", function() {
    expect(interpreter.program(
      "var o={" +
        "p:1" +
      "};" +
      "delete o.p;" +
      "return o;")).toEqual({});
  });
  
  it("postfix ++ adds that little extra, but keeps it to itself", function() {
    expect(interpreter.program(
      "var a=1," +
      "b=a++;" +
      "return {a:a,b:b};")).toEqual({a: 2, b: 1});
  });
  
  it("postfix -- doesn't drag you down", function() {
    expect(interpreter.program(
      "var a=1," +
      "b=a--;" +
      "return {a:a,b:b};")).toEqual({a: 0, b: 1});
  });
  
  it("typeof returns the type of the operand", function() {
    expect(interpreter.program("return typeof 1;")).toBe("number");
  });
  
  it("- argues just for fun", function() {
    expect(interpreter.program(
      "return -1;")).toBe(-1);
  });
  
  it("! returns the inverse of the expressions truthiness", function() {
    expect(interpreter.program(
      "var a;" +
      "return !a;")).toBe(true);
  });
  
  it("* can go out in the world and multiply", function() {
    expect(interpreter.program("return 3*5;")).toBe(15);
  });
  
  it("+ can add two and two", function() {
    expect(interpreter.program("return 2+3;")).toBe(5);
  });
  
  it("- has a problem with the concepts \"yours\" and \"mine\"", function() {
    expect(interpreter.program("return 2-5;")).toBe(-3);
  });
  
  it("< is direct", function() {
    expect(interpreter.program("return 1<2;")).toBe(true);
  });
  
  it("> can test what is truly great(er)", function() {
    expect(interpreter.program("return 42>42;")).toBe(false);
  });
  
  it("instanceof can tell who really belongs", function() {
    expect(interpreter.program(
      "var C=function() {}," +
      "o=new C();" +
      "return o instanceof C;")).toBe(true);
  });
  
  it("=== can tell if two values exactly the same thing", function() {
    expect(interpreter.program("return {}==={};")).toBe(false);
  });
  
  it("!== can tell if two values are not like at all", function() {
    expect(interpreter.program("return undefined!==null;")).toBe(true);
  });
  
  it("+= puts cake on your cake", function() {
    expect(interpreter.program(
      "var a=2;" +
      "a+=3;" +
      "return a;")).toBe(5);
  });
  
});
