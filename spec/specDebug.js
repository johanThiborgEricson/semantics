describe("Debugging messages", function() {
  var they = it;
  var xthey = xit;
  var interpreter;
  var factory = new InterpreterMethodFactory();
  
  beforeEach(function() {
    interpreter = {};
    interpreter.text = factory.atom(/text/, function() {});
    interpreter.lineBreak = factory.atom(/\n/, function() {});
    interpreter.paragraph = factory.group("text", "lineBreak");
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
    try {
      interpreter.paragraph("Something else\n");
    } catch(e) {}
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("report parse start, end and success when called internally and " + 
  "externally and succeeding", 
  function() {

    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("%s: parse start", "paragraph");
    expect(console.log).toHaveBeenCalledWith("%s: parse start", "text");
    expect(console.log).toHaveBeenCalledWith("%s: parse success", "text");
    expect(console.log).toHaveBeenCalledWith("%s: parse success", "paragraph");
  });
  
  they("report parse start, end and failure when called internally and " + 
  "externally and failing", 
  function() {

    try {
      interpreter.paragraph("Something else\n", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("%s: parse start", "paragraph");
    expect(console.log).toHaveBeenCalledWith("%s: parse start", "text");
    expect(console.log).toHaveBeenCalledWith("%s: parse fail", "text");
    expect(console.log).toHaveBeenCalledWith("%s: parse fail", "paragraph");
  });
  
  they("if a match is successful, reports success, the regExp, the rest of " + 
  "the current line and the full match", function() {
    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("%s.exec(\"%s\") // %s", "/text/", 
    "text", "text");
  });
  
  they("if a match fails, reports the failure, the regExp and the rest of " + 
  "the current line", function() {
    try {
      interpreter.paragraph("Something else", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("%s.exec(\"%s\") // %s", 
    "/text/", "Something else", "null");
  });
  
  they("can tell the name of the called method, even if there are other " + 
  "methods with the same function", function() {
    interpreter.a1 = factory.atom(/a/, function() {});
    interpreter.a2 = interpreter.a1;
    interpreter.aa = factory.group("a1", "a2", function() {});

    interpreter.aa("aa", true);
    
    expect(console.log).toHaveBeenCalledWith("%s: parse start", "a1");
    expect(console.log).toHaveBeenCalledWith("%s: parse start", "a2");
  });
  
});
