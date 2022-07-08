//Return true if number is in printable ascii range
//Mode: 0 = Dec, 1 = Bin, 2 = Oct
function valid_ascii(number, mode)
{
	if(number == "")	//Sanity check
	{
		return false;
	}
	
    if(mode == 0)
	{
        int_num = parseInt(number, 10);
	}
    else if(mode == 1)
	{
        int_num = parseInt(number, 2);
	}
    else if(mode == 2)
	{
        int_num = parseInt(number, 8);
	}
	
    if(31 < int_num && int_num < 127)
	{
        return true;
	}
    else
	{
		
        return false;
	}

}

//Return decoded plaintext after parsing with spacing.
//Mode: 0=Dec, 1=Bin, 2=Oct
function space_brute(ct, mode)
{
	ct_len = ct.length
	i = 0;
	spaced_array = [];
	
	//Binary Section
	if(mode == 1)
	{
		tmp_chunk = "";
		while (i < ct_len - 1)
		{
			for (let j = 7; j>0; j--)
			{
				tmp_chunk = ct.slice(i, i+j);
				
				if(valid_ascii(tmp_chunk, mode))
				{
					spaced_array.push(tmp_chunk);
					i += j-1;
					break;
				}
				
			}
		
			i++
		}
		
	}
	return spaced_array;
}

//I don't know why I made this whole thing object orientated it just caused me pain
//Class that holds the current state of the ciphertext. Use its methods to update state
class ciphertextState
{
	constructor(ciphertext, mode)
	{
		ciphertextState.ct = ciphertext;
		ciphertextState.mode = mode;	//Will always be 1 for binary in this case
		ciphertextState.history = [];	//Will hold previous choices
		ciphertextState.inst_context = this;	//To refer to context within methods called otherwise
	}
	
	//Find the 2 to 3 possabilities for the first (current) letter
	First_Possabilities()
	{
		var mode = ciphertextState.mode;
		var ct = ciphertextState.ct;
		var possible_array = [];	//Holds all the possible binary values that are printable
		
		//Shrink the window logging all valid binary values
		for (let j = 7; j>0; j--)
		{
			var tmp_chunk = ct.slice(0, 0+j);
			if(valid_ascii(tmp_chunk, mode))
			{
				possible_array.push(tmp_chunk);
			}
			
		}	
		
		ciphertextState.current_possible = possible_array;	//Hold it in the state for future use

		//Now possible_array holds all the valid n-bit binary possabilities
		//We now need to create n buttons to hold each possability
		//For each first subtract the binary possability and then run the bruteforce
		//On the leftover string. This gives us the rest of the string for that option for a preview

		//For each possabiltiy calculate the rest of the string after removing that possability prefix
		var possible_array_suffix = [];
		for( var k = 0; k < possible_array.length; k++ )
		{
			var tmp_ct = ct.slice(possible_array[k].length, ct.length);	//Remove prefix part
			var tmp_spaced_array = space_brute(tmp_ct, 1);
			var tmp_string = "";
			
			//Convert result to a string to preview it
			for( var l = 0; l < tmp_spaced_array.length; l++ )	//Mate I'm running out of counting variables
			{
				tmp_string += String.fromCharCode(parseInt(tmp_spaced_array[l], 2));
			}
			
			possible_array_suffix.push(tmp_string);
		}
		
	
		//Reset any existing fields and populate them with these new choices
		//First check if any exist already, if so then remove all of them
		if(document.getElementsByClassName("options").length != 0)
		{
			var select_boxes = document.getElementsByClassName("options");
			
			//Dirty workaround because it kept missing elements
			while(true)
			{
				try
				{
					select_boxes[0].remove();
				}
				catch
				{
					break
				}
			}		
		}
		
		
		//Now create the new choices
		var myParent = document.getElementById("selectBoxes");
		for( var i = 0; i < possible_array.length; i++ )
		{
			//Create array of options to be added
			var array = possible_array_suffix[i];

			//Create and append a div to hold this option
			var div_option = document.createElement("div");
			div_option.className = "options";
			div_option.id = i;
			myParent.appendChild(div_option);

			//Create and append the actual option to this div
			var option = document.createElement("a");
			option.text = array;
			option.href = "#";
			option.style.fontSize = "20px";
			option.onclick = this.update_state;

			//Write the choice letter prefix seperately from the link
			var prefix_letter = document.createElement("a");
			var letter = String.fromCharCode(parseInt(possible_array[i], 2));
			
			//Make certain choices more clear
			if(letter == " ")
			{
				letter = "{Space}";
			}
			
			//If we're on the last letter then make the prefix choice the link as well
			if(array.length == 0)
			{
				prefix_letter.href = "#";
				prefix_letter.onclick = this.update_state;
			}
			
			//Set and format it
			prefix_letter.text = letter;
			prefix_letter.style.fontSize = "27px";
			
			//Add both to the correct parent section of the page
			div_option.appendChild(prefix_letter);
			div_option.appendChild(option);
		}		
		
		//Let user know if there weren't any options
		if(possible_array.length == 0)
		{
			//Create and append select list
			var div_option = document.createElement("div");
			div_option.className = "options";
			div_option.id = i;
			myParent.appendChild(div_option);

			var option = document.createElement("a");
			option.text = "No options available, try undo"
			option.href = "#";
			option.style.fontSize = "20px";
			div_option.appendChild(option);
		}		
	}

	//Change the current ciphertext and log the history
	update_state()
	{
		//This will correspond to whatever choice made for the current chunk
		var called_id = this.parentNode.id;
		var possible_array = ciphertextState.current_possible;
		
		//Update the ciphertext, history, and then call the possability method for the next chunk
		var ct = ciphertextState.ct;
		var tmp_ct = ct.slice(possible_array[called_id].length, ct.length);		
		ciphertextState.ct = tmp_ct;
			
		//Add the current choice to history
		var old_history = ciphertextState.history;
		old_history.push(possible_array[called_id]);
		
		//Update the current plaintext
		var current_plaintext = "";
		for( var i = 0; i < old_history.length; i++ )
		{		
			current_plaintext += String.fromCharCode(parseInt(old_history[i], 2));
		}
		document.getElementsByName("outputTxt")[0].innerText = current_plaintext;
		
		//Finally check the next section
		ciphertextState.inst_context.First_Possabilities();
	}
	
	//Undo the last action, revert to previous state
	undo()
	{		
		//Change the current CT as well i.e. add on the last history entry before we delete it
		var old_history = ciphertextState.history;
		var old_ct = ciphertextState.ct;
		
		//Sanity check, make sure there actually is anything to undo to
		if(old_history.length == 0)
		{
			return false;
		}
		ciphertextState.ct = old_history[old_history.length-1].concat(old_ct);
		
		//Remove the last entry in the history array
		old_history.splice(old_history.length-1, 1);
		
		//Update the current plaintext
		var current_plaintext = "";
		for( var i = 0; i < old_history.length; i++ )
		{		
			current_plaintext += String.fromCharCode(parseInt(old_history[i], 2));
		}
		document.getElementsByName("outputTxt")[0].innerText = current_plaintext;	
		
		//Re-call first possabilities for this old state
		ciphertextState.inst_context.First_Possabilities();
	}
}