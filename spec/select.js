describe("A selection", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  var fail = function() {
    return "failure";
  };
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      b: f.atom(/b/),
      c: f.atom(/c/),
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
    
    it("can return regex matches", function() {
      interpreter.ab = f.select(0, /a/, /b/);
      
      var result = interpreter.ab("ab");
      expect(result[0][0]).toBe("a");
      expect(result[1][0]).toBe("b");
    });
    
  });
  
  it("calls the selected part as methods of the interpreter", function() {
    interpreter.charEater = f.atom(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.select = f.select(1, "charEater");
    interpreter.select("c");
    
    expect(interpreter.eatenChar).toBe("c");
  });
  
  it("only runs the selected interpretation", function() {
    var a = jasmine.createSpy("a");
    var b = jasmine.createSpy("b");
    interpreter = {
      a: f.atom(/a/, a),
      b: f.atom(/b/, b),
      ab: f.select(2, "a", "b"),
    };
    
    interpreter.ab("ab");
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });
  
  it("fails to parse if a method part fails to parse", function() {
    interpreter.abc = f.select(1, "a", "b", "c");
    interpreter.fail = f.atom(/a/, fail);
    interpreter.program = f.or("abc", "fail");
    
    expect(interpreter.program("a")).toBe("failure");
  });
  
  it("fails to parse if a regex part fails to parse", function() {
    interpreter.abc = f.select(1, /a/, /b/, /c/);
    interpreter.fail = f.atom(/a/, fail);
    interpreter.program = f.or("abc", "fail");
    
    expect(interpreter.program("a")).toBe("failure");
  });
  
});
