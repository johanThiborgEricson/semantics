describe("Debugging messages", function() {
  var they = it;
  var xthey = xit;
  var interpreter;
  var f;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
  });
  
  beforeEach(function() {
    interpreter = {
      text: f.terminal(/text/),
      lineBreak: f.terminal(/\n/),
      paragraph: f.group("text", "lineBreak"),
      somethingElse: f.terminal(/Something else\n?/),
    };
    
    spyOn(console, "log");
  });
  
  they("can be turned on", function() {
    interpreter.text("text", true);
    
    expect(console.log).toHaveBeenCalled();
  });
  
  they("are turned off by default", function() {
    interpreter.text("text");
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("aren't showed when called externally internally if failing if " + 
  "turned off", 
  function() {
    interpreter.program = f.or("paragraph", "somethingElse");
    interpreter.program("Something else\n");
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("report parse start, end and success when called internally and " + 
  "externally and succeeding", 
  function() {

    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("%s%s", "", "paragraph");
    expect(console.log).toHaveBeenCalledWith("%s%s", "  ", "text");
    expect(console.log).toHaveBeenCalledWith(
      "%s%s %s", "  ", "text", "\"text\"");
    expect(console.log).toHaveBeenCalledWith(
      "%s%s %s", "", "paragraph", "\"text\n\"");
  });
  
  they("report parse start, end and failure when called internally and " + 
  "externally and failing", 
  function() {
    interpreter.program = f.or("paragraph", "somethingElse");
    interpreter.program("Something else\n", true);
    
    expect(console.log).toHaveBeenCalledWith("%s%s", "  ", "paragraph");
    expect(console.log).toHaveBeenCalledWith("%s%s", "    ", "text");
    expect(console.log).toHaveBeenCalledWith(
      "%s%s %s", "    ", "text", "failed");
    expect(console.log).toHaveBeenCalledWith(
      "%s%s %s", "  ", "paragraph", "failed");
  });
  
  they("if a match is successful, reports success, the regExp, the rest of " + 
  "the current line and the full match", function() {
    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("%s\n%s", "text\n^", "/text/");
  });
  
  they("if a match fails, reports the failure, the regExp and the rest of " + 
  "the current line", function() {
    interpreter.program = f.or("paragraph", "somethingElse");
    interpreter.program("Something else", true);
    
    expect(console.log).toHaveBeenCalledWith("%s\n%s", 
    "Something else\n^", "/text/");
  });
  
  they("can tell the name of the called method, even if there are other " + 
  "methods with the same function", function() {
    interpreter.a1 = f.terminal(/a/, function() {});
    interpreter.a2 = interpreter.a1;
    interpreter.aa = f.group("a1", "a2", function() {});

    interpreter.aa("aa", true);
    
    expect(console.log).toHaveBeenCalledWith("%s%s", "  ", "a1");
    expect(console.log).toHaveBeenCalledWith("%s%s", "  ", "a2");
  });
  
  describe("in head recursion", function() {
    
    var f;
    
    beforeAll(function() {
      f = new InterpreterMethodFactory();
    });

    it("reports forgetting intermediate results", function() {
      interpreter.a = f.terminal(/a/);
      interpreter.abcs = f.or("abcs1", "a");
      interpreter.abcs1 = f.wrap("abcsb", /c/);
      interpreter.abcsb = f.wrap("abcs", /b/);
      
      interpreter.abcs("abc", true);
      expect(console.log).toHaveBeenCalledWith(
        "Forgetting %s=%s", "abcs1", "\"abc\"");
      expect(console.log).toHaveBeenCalledWith(
        "Forgetting %s=%s", "abcsb", "\"ab\"");
    });
    
  });
  
});
