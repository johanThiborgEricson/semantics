/**
 * @name selectUnitTests
 */
describe("A selection", function() {
  
  var f;
  var interpreter;
  var fail = function() {
    return "failure";
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
      b: f.terminal(/b/),
      c: f.terminal(/c/),
    };
    
  });
  
  describe("if zero is selected", function() {
    it("returns an array", function() {
      interpreter.noChoice = f.select(0);
      expect(interpreter.noChoice("")).toEqual([]);
    });
    
    it("returns the results of its parts", function() {
      interpreter.ab = f.select(0, "a", "b");
      expect(interpreter.ab("ab")).toEqual(["a", "b"]);
    });
    
    it("calls its children as methods of the interpreter", function() {
      interpreter.charEater = f.terminal(/./, function(theChar) {
        this.eatenChar = theChar;
      });
      
      interpreter.select = f.select(0, "charEater");
      interpreter.select("c");
      expect(interpreter.eatenChar).toBe("c");
    });
    
  });
  
  it("only runs the selected interpretation", function() {
    var a = jasmine.createSpy("a");
    var b = jasmine.createSpy("b");
    interpreter = {
      a: f.terminal(/a/, a),
      b: f.terminal(/b/, b),
      ab: f.select(2, "a", "b"),
    };
    
    interpreter.ab("ab");
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });
  
  it("fails to parse if a method part fails to parse", function() {
    interpreter.abc = f.select(1, "a", "b", "c");
    interpreter.fail = f.terminal(/a/, fail);
    interpreter.program = f.or("abc", "fail");
    
    expect(interpreter.program("a")).toBe("failure");
  });
  
  it("can skip leading anonymous terminals", function() {
    interpreter.abc = f.select(0, /a/, /b/, "c");
    expect(interpreter.abc("abc")).toEqual(["c"]);
  });
  
  it("fails to parse if leading anonymous terminals fails to parse", 
  function() {
    interpreter.ab = f.select(0, /a/, "b");
    interpreter.fail = f.terminal(/b/, fail);
    interpreter.program = f.or("ab", "fail");
    expect(interpreter.program("b")).toBe("failure");
  });
  
  it("doesn't parse the second anonymous terminal twice", function() {
    interpreter.abc = f.select(0, /a/, /b/, "c");
    interpreter.fail = f.terminal(/abbc/, fail);
    interpreter.program = f.or("abc", "fail");
    expect(interpreter.program("abbc")).toBe("failure");
  });
  
});
