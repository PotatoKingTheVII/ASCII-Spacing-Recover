//Return true if number is in printable ascii range
//Mode: 0=Dec, 1=Oct, 2=Hex, 3+ = Bin
function valid_ascii(number, mode, low_num, high_num)
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
        int_num = parseInt(number, 8);
	}
    else if(mode == 2)
	{
        int_num = parseInt(number, 16);
	}
    else if(mode > 2)
	{
        int_num = parseInt(number, 2);
	}

    if(low_num <= int_num && int_num <= high_num)
	{
        return true;
	}
    else
	{
        return false;
	}

}

//Return decoded plaintext after parsing with spacing.
//Mode: 0=Dec, 1=Oct, 2=Hex, 3+ = Bin
function space_brute(ct, mode, low_num, high_num)
{
	ct_len = ct.length
	i = 0;
	spaced_array = [];
	
	//Decimal + Octal Section
	if(mode < 2)
	{
		tmp_chunk = "";
		while (i < ct_len - 1)
		{
			for (let j = 3; j>1; j--)
			{
				tmp_chunk = ct.slice(i, i+j);
				
				if(valid_ascii(tmp_chunk, mode, low_num, high_num))
				{
					spaced_array.push(tmp_chunk);
					i += j-1;
					break;
				}
			}
			i++
		}
	}
	
	//Hex section
	if(mode == 2)
	{
		tmp_chunk = "";
		while (i < ct_len - 1)
		{
			for (let j = 2; j>0; j--)
			{
				tmp_chunk = ct.slice(i, i+j);
				
				if(valid_ascii(tmp_chunk, mode, low_num, high_num))
				{
					spaced_array.push(tmp_chunk);
					i += j-1;
					break;
				}
			}
			i++
		}
	}
	
	//Binary Section - Forward scrubbing
	if(mode == 3 || mode == 4)
	{
		tmp_chunk = "";
		
		while (i < ct_len - 1)
		{
			if( mode == 3 )	//High bytes
			{
				for (let j = 8; j>0; j--)
				{
					tmp_chunk = ct.slice(i, i+j);
					
					if(valid_ascii(tmp_chunk, mode, low_num, high_num))
					{
						spaced_array.push(tmp_chunk);
						i += j-1;
						break;
					}
				}
				i++
			}
			
			else	//Low bytes
			{
				for (let j = 1; j<8; j++)
				{
					tmp_chunk = ct.slice(i, i+j);
					
					if(valid_ascii(tmp_chunk, mode, low_num, high_num))
					{
						spaced_array.push(tmp_chunk);
						i += j-1;
						break;
					}
				}
				i++	
			}
		}
	}
	
	
	//Binary Section - Backwards scrubbing
	if(mode > 4)
	{
		i = ct_len;
		tmp_chunk = "";
		
		while (i >= 0)
		{
			if( mode == 5 )	//High bytes
			{
				for (let j = 7; j>0; j--)
				{
					tmp_chunk = ct.slice(i, i+j);
					
					if(valid_ascii(tmp_chunk, mode, low_num, high_num))
					{
						spaced_array.push(tmp_chunk);
						i -= j-1;
						break;
					}
				}
				i--
			}
			
			else	//Low bytes
			{
				for (let j = 1; j<8; j++)
				{
					tmp_chunk = ct.slice(i, i+j);
					
					if(valid_ascii(tmp_chunk, mode, low_num, high_num))
					{
						spaced_array.push(tmp_chunk);
						i -= j-1;
						break;
					}
				}
				i--	
			}
		}
	}	
	
	//Format + return final plaintext
	if(mode == 0) {base = 10}
    else if(mode == 1) {base = 8}
    else if(mode == 2) {base = 16}
    else if(mode > 2) {base = 2}
    if(mode > 4) {spaced_array.reverse()} //I.e. we worked backwards so reverse the array

    plaintext = "";
	
	for (let j = 0; j<=spaced_array.length; j++)
	{
		c_byte = spaced_array[j];
		plaintext += String.fromCharCode(parseInt(c_byte, base));
	}
	
	return plaintext;
}