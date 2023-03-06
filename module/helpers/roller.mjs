export function _caseInsensitiveReplace(line, word, replaceWith) {
  var regex = new RegExp('(' + word + ')', 'gi');
  return line.replace(regex, replaceWith);
}

export function processRollResult(roll){
  let messageText = "";

  let dice = roll.dice[0];
  
  messageText = '<div class="dice-roll">';
  messageText += '<div class="dice-result">';
  let success_count = 0;
  let failure_count = 0;
  let dice_html = "";
  let is_success = true;
  let is_fumble = false;
  let dice_counter = {1:0,2:0,3:0,4:0,5:0,6:0}

  for(let i = 0; i < dice.results.length; i++){
    let result = dice.results[i];
    if(result.result == 6 || result.result == 5){
      success_count++;
    }else if(result.result == 1){
      failure_count++;
    }
    dice_counter[result.result] += 1;
  }

  for(let x = 1; x <= 6; x++){
    let color = "black";
    if(x == 1){
      color = "red";
    }else if(x >= 5){
      color = "green;"
    }
    dice_html += "<strong>"+x+"</strong>: <span style='color: white; background:"+color+";padding: 2px; margin-right: 3px;'>"+dice_counter[x]+"</span>";
  }

  if(success_count < failure_count || success_count == 0){
    is_success = false;
  }

  if(failure_count > (dice.results.length / 2)){
    is_success = false;
    is_fumble = true;
  }

  if(is_success){
    messageText += "<h4 class='dice-total' style='color:green;'>";
  }
  else{
    if(is_fumble){
      messageText += "<h4 class='dice-total' style='color:red;'>FUMBLE<br/>";
    }else{
      messageText += "<h4 class='dice-total' style='color:red;'>FAILURE<br/>";
    }
    
  }
  messageText += "<span style='margin-right:10px'><strong>Successes: "+success_count+"</strong></span>";
  messageText += "<strong>Failures: "+failure_count+"</strong><br/>";
  messageText += "</h4>";

  
  messageText += "<div style='margin-top: 10px;'>";
  messageText += dice_html;
  messageText += "<small>Roll: "+roll._formula+"</small>";
  messageText += '</div>';

  messageText += '</div>';
  messageText += '</div>';

  
  return messageText;
}