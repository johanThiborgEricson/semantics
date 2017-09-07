describe("A group", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  
  beforeEach(function() {
    interpreter = {};
    interpreter.a = f.atom(/a/);
    interpreter.b = f.atom(/b/);
    interpreter.ac = f.atom(/a/, (function() {
      var i = 1;
      return function(a) {
        return a+i++;
      };
    })());
    
  });
  
  it("returns an object with the result of its only part", function() {
    interpreter.group = f.group("a");
    
    expect(interpreter.group("a")).toEqual({a: "a"});
  });
  
  it("calls its parts as methods of the interpreter", function() {
    interpreter.readChar = f.atom(/./, function(char) {
      this.char = char;
    });
    
    interpreter.group = f.group("readChar");
    interpreter.group("a");
    
    expect(interpreter.char).toBe("a");
  });
  
  it("may contain many parts", function() {
    interpreter.group = f.group("a", "b");
    
    expect(interpreter.group("ab")).toEqual({a: "a", b: "b"});
  });
  
  it("puts the results in an array if there are two parts with the same name", 
  function() {
    interpreter.group = f.group("ac", "ac");
    
    expect(interpreter.group("aa")).toEqual({ac: ["a1", "a2"]});
  });
  
  it("puts the results in an array if there are many parts with the same name", 
  function() {
    interpreter.group = f.group("ac", "ac", "ac");
    
    expect(interpreter.group("aaa")).toEqual({ac: ["a1", "a2", "a3"]});
  });
  
  it("can have parts with wierd names", function() {
    // My IDE thinks "hasOwnProperty is a really bad name"...
    var hop = "hasOwnProperty"; 
    var emptyString = "";
    interpreter.appendProperty = f.empty(function() {
      return "appended property";
    });
    
    interpreter[hop] = f.atom(/hasOwnProperty/);
    interpreter.toString = f.atom(/toString/);
    interpreter[emptyString] = f.atom(/empty/);
    interpreter.length = f.atom(/length/);
    interpreter.wierdNames = f.group(
      "appendProperty", "hasOwnProperty", "toString", "", "length");
    
    var expected = {};
    expected.appendProperty = "appended property";
    expected[hop] = "hasOwnProperty";
    expected.toString = "toString";
    expected[emptyString] = "empty";
    expected.length = "length";
    expect(interpreter.wierdNames("hasOwnPropertytoStringemptylength"))
    .toEqual(expected);
  });
  
  it("accepts all kinds of results from its parts", function() {
    interpreter.emptyArray = f.empty(function() {
      return [];
    });
    
    interpreter.undef = f.empty(function() {
      return undefined;
    });
    
    interpreter.group = f.group("emptyArray", "emptyArray", "undef", "undef");
    
    expect(interpreter.group("")).toEqual({
      emptyArray: [[], []],
      undef: [undefined, undefined]
    });
    
  });
  
  it("may have an interpretation", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.group = f.group("a", interpretation);
    
    interpreter.group("a");
    
    expect(interpretation).toHaveBeenCalled();
  });
  
  it("calls the interpretation as a method of the interpreter", function() {
    interpreter.thisChecker = f.group("a", function() {
      this.isThis = true;
    });
    
    interpreter.thisChecker("a");
    
    expect(interpreter.isThis).toBe(true);
  });
  
  it("returns the result of the interpretation", function() {
    interpreter.hasResult = f.group("a", function() {
      return "result of interpretation";
    });
    
    expect(interpreter.hasResult("a")).toBe("result of interpretation");
  });
  
  it("calls the interpretation with the results of the parts", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter.ac2 = f.group("ac", "ac", interpretation);
    
    interpreter.ac2("aa");
    
    expect(interpretation).toHaveBeenCalledWith("a1", "a2");
  });
  
  it("skips over any regular expression", function() {
    interpreter.paddedA = f.group(/pad/, "a", /pad/);
    
    expect(interpreter.paddedA("padapad")).toEqual({a: "a"});
  });
  
  it("accepts string objects", function() {
    interpreter.group = f.group(String("a"));
    
    expect(interpreter.group("a")).toEqual({a: "a"});
  });
  
  it("fails if a part fails to parse", function() {
    interpreter.groupA = f.group("a");
    interpreter.ab = f.or("groupA", "b");
    
    expect(interpreter.ab("b")).toBe("b");
  });
  
  it("fails if a regular expression fails to parse", function() {
    interpreter.groupA = f.group(/a/);
    interpreter.ab = f.or("groupA", "b");
    
    expect(interpreter.ab("b")).toBe("b");
  });
  
  it("doesn't fail on empty regular expressions", function() {
    interpreter.group = f.group(/(:?)/);
    
    expect(interpreter.group("")).toEqual({});
  });
  
  it("doesn't leave a group half parsed", function() {
    interpreter.ab = f.group("a", "b");
    interpreter.ac = f.atom(/ac/);
    interpreter.abac = f.or("ab", "ac");
    
    expect(interpreter.abac("ac")).toBe("ac");
  });
  
  it("correctly reparses a part", function() {
    interpreter.c = f.atom(/c/);
    interpreter.ab = f.group("a", "b");
    interpreter.ac = f.group("a", "c");
    interpreter.abac = f.or("ab", "ac");
    
    expect(interpreter.abac("ac")).toEqual({a: "a", c: "c"});
  });
  
});
