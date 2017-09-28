describe("A string literal", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("may contain a single character", function() {
    expect(interpreter.program("return 'a';")).toBe('a');
  });
  
  it("may contain many characters", function() {
    expect(interpreter.program("return 'abc';")).toBe('abc');
  });
  
  it("may be padded with spaces", function() {
    expect(interpreter.program("return '  a  ';")).toBe('  a  ');
  });
  
  it("may contain many \\b, \\f, \\n, \\r, \\t and \\vs", function() {
    expect(interpreter.program(
      "return '\\b, \\f, \\n, \\r, \\t and \\vs';")
    ).toBe('\b, \f, \n, \r, \t and \vs');
  });
  
  it("may contain escaped back slashes", function() {
    expect(interpreter.program(
      "return '\\\\n';")
    ).toBe('\\n');
  });
  
  describe("with single quotes", function() {
    
    it("may be empty", function() {
      expect(interpreter.program("return '';")).toBe('');
    });
    
    it("may contain escaped quotation marks", function() {
      expect(interpreter.program(
        "return '\\\'\\\"';")
      ).toBe('\'\"');
    });
    
  });
  
  describe("with double quotes", function() {
    
    it("may be empty", function() {
      expect(interpreter.program('return "";')).toBe("");
    });
    
    it("may contain escaped quotation marks", function() {
      expect(interpreter.program('return "\\\'\\\"";')).toBe('\'\"');
    });
    
  });
  
});
