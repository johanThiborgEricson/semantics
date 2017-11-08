describe("The at least quantifier", function() {
  
  var f;
  var interpreter;
  var parseFail = function() {
    return "parse fail";
  };
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
      atLeastZero: f.atLeast(0, "a"),
      list: f.atLeast(0, "a", /d/),
      insignificant: f.insignificant("atLeastZero", /i/),
      insigList: f.insignificant("list", /i/),
    };
    
  });
  
  it("can parse one child", function() {
    expect(interpreter.atLeastZero("a")).toEqual(["a"]);
  });
  
  it("runs the interpretation of its children as methods", function() {
    interpreter.charEater = f.terminal(/./, function(theChar) {
      this.eatenChar = theChar;
    });
    
    interpreter.charEaters = f.atLeast(0, "charEater");
    interpreter.charEaters("a");
    expect(interpreter.eatenChar).toBe("a");
  });
  
  it("may parse no children", function() {
    expect(interpreter.atLeastZero("")).toEqual([]);
  });
  
  it("may parse many children", function() {
    expect(interpreter.atLeastZero("aaa")).toEqual(["a", "a", "a"]);
  });
  
  it("may have a delimiter", function() {
    expect(interpreter.list("ada")).toEqual(["a", "a"]);
  });
  
  it("must parse the delimiter", function() {
    interpreter.fail = f.terminal(/aa/, parseFail);
    interpreter.program = f.longest("list", "fail");
    expect(interpreter.program("aa")).toBe("parse fail");
  });
  
  it("can parse insignificants", function() {
    expect(interpreter.insignificant("iaiai")).toEqual(["a", "a"]);
  });
  
  it("must parse the insignificant", function() {
    interpreter.fail = f.terminal(/iaai/, parseFail);
    interpreter.program = f.longest("insignificant", "fail");
    expect(interpreter.program("iaai")).toBe("parse fail");
  });
  
  it("unparses delimiter if child can't be parsed", function() {
    interpreter.fail = f.terminal(/ad/, parseFail);
    interpreter.listAndDelimiter = f.group("list", /d/);
    interpreter.program = f.or("listAndDelimiter", "fail");
    expect(interpreter.program("ad")).toEqual({list: ["a"]});
  });
  
  it("can parse insgnificants before delimiters", function() {
    expect(interpreter.insigList("iaidiai")).toEqual(["a", "a"]);
  });
  
  it("must parse insignificants before delimiters", function() {
    interpreter.fail = f.terminal(/iai?di?ai/, parseFail);
    interpreter.program = f.longest("insigList", "fail");
    expect(interpreter.program("iadiai")).toBe("parse fail");
    expect(interpreter.program("iaidai")).toBe("parse fail");
  });
  
  it("may specify a lowest accepted bound of children", function() {
    interpreter.atLeastThree = f.atLeast(3, "a");
    interpreter.fail = f.terminal(/aa/, parseFail);
    interpreter.program = f.or("atLeastThree", "fail");
    expect(interpreter.program("aa")).toBe("parse fail");
    expect(interpreter.program("aaa")).toEqual(["a", "a", "a"]);
  });
  
  it("may have an interpretation", function() {
    var interpretation = jasmine.createSpy("interpretation");
    interpreter = {
      child: f.terminal(/(children)|(results)/),
      atLeast: f.atLeast(0, "child", interpretation),
    };
    
    interpreter.atLeast("childrenresults");
    expect(interpretation).toHaveBeenCalledWith(["children", "results"]);
  });
  
  it("calls its interpretation as a method of the interpreter", function() {
    interpreter = {
      charEater: f.terminal(/./),
      charsEater: f.atLeast(0, "charEater", function(theChars) {
        this.eatenChars = theChars;
      }),
      
    };
    
    interpreter.charsEater("chars");
    expect(interpreter.eatenChars).toEqual(["c", "h", "a", "r", "s"]);
  });
  
  it("returns the result of its interpretation", function() {
    interpreter.atLeast = f.atLeast(0, "a", function() {
      return "interpretation result";
    });
    
    expect(interpreter.atLeast("")).toBe("interpretation result");
  });
  
  it("may have both delimiters and an interpretation", function() {
    interpreter.interpretedList = f.atLeast(0, "a", /d/, function() {
      return "fancy interpretation";
    });
    
    expect(interpreter.interpretedList("adada")).toBe("fancy interpretation");
  });
  
  it("can handle if the first child messes up the code pointer when it fails", 
  function() {
    f.uglyFail = function() {
      return this.makeMethod(function(codePointer, interpreter) {
        codePointer._pointer++;
        return null;
      });
      
    };
    
    interpreter.uglyFail = f.uglyFail();
    interpreter.atLeast = f.atLeast(0, "uglyFail");
    interpreter.program = f.wrap("atLeast", /a/);
    expect(interpreter.program("a")).toEqual([]);
  });
});
