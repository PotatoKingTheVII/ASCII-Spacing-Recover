def valid_ascii(number, mode):
    """
    Retruns true if printable ascii range
    Mode: 0=Dec, 1=Oct, 2=Hex, 3+ = Bin
    """

    #For edge case at end with empty number. Sanity check
    if(number == ""):
        return False
    
    if(mode == 0):
        int_num = int(number, 10)
    elif(mode == 1):
        int_num = int(number, 8)
    elif(mode == 2):
        int_num = int(number, 16)
    elif(mode > 2):
        int_num = int(number, 2)

    #Range that is considered valid, can up to 65 if ct is only letters etc for better results
    if(31 < int_num < 127):
        return True
    else:
        return False

def space_brute(ct, mode):
    """
    Returns decoded plaintext after parsing with spacing.
    Mode: 0=Dec, 1=Oct, 2=Hex, 3+ = Bin
    """
    
    ct_len = len(ct)
    spaced_array = []
    i = 0

    #Decimal + Octal Section
    if(mode < 2):
        tmp_chunk = ""
        
        while i < ct_len - 1:   #Work through the CT
            for j in range(3,1,-1): #Change window size till valid chunk found
                tmp_chunk = ct[i:i+j]
                if(valid_ascii(tmp_chunk, mode)):
                   spaced_array.append(tmp_chunk)
                   i+=j-1   #-1 because the infinite loop addition happens regardless next
                   break
                
            i+=1    #If we're here then there's no valid option, jump forward one to avoid infinite loop


    #Hex Section
    if(mode == 2):
        tmp_chunk = ""
        
        while i < ct_len - 1:   #Work through the CT
            for j in range(2,0,-1): #Change window size till valid chunk found
                tmp_chunk = ct[i:i+j]
                if(valid_ascii(tmp_chunk, mode)):
                   spaced_array.append(tmp_chunk)
                   i+=j-1   #-1 because the infinite loop addition happens regardless next
                   break
                
            i+=1    #If we're here then there's no valid option, jump forward one to avoid infinite loop


    #Binary Section - Forward scrubbing
    if(mode == 3 or mode == 4):
        tmp_chunk = ""

        if(mode == 3):  #High bytes
            start = 7
            end = 0
            step = -1

        else:   #Low bytes (mode = 4)
            start = 1
            end = 8
            step = 1
            
        while i < ct_len - 1:
            for j in range(start,end,step):
                tmp_chunk = ct[i:i+j]
                if(valid_ascii(tmp_chunk, mode)):
                   spaced_array.append(tmp_chunk)
                   i+=j-1   #-1 because the infinite loop addition happens regardless next
                   break
                
            i+=1    #If we're here then there's no valid option, jump forward one to avoid infinite loop


    #Binary Section - Backwards scrubbing
    if(mode >4):
        i = ct_len #So we start from the back
        tmp_chunk = ""

        if(mode == 5):  #High bytes
            start = 7
            end = 0
            step = -1

        else:   #Low bytes (mode = 6)
            start = 1
            end = 8
            step = 1
            
        while i >= 0:
            for j in range(start,end,step):
                tmp_chunk = ct[i:i+j]
                if(valid_ascii(tmp_chunk, mode)):
                   spaced_array.append(tmp_chunk)
                   i-=j-1   #-1 because the infinite loop addition happens regardless next
                   break
                
            i-=1    #If we're here then there's no valid option, jump forward one to avoid infinite loop


    #Format + return final plaintext
    if(mode == 0):
        base = 10
    elif(mode == 1):
        base = 8
    elif(mode == 2):
        base = 16
    elif(mode > 2):
        base = 2
    if(mode > 4):   #I.e. we worked backwards so reverse the array
        spaced_array = spaced_array[::-1]

    plaintext = ""
    for byte in spaced_array:
        plaintext += chr(int(byte, base))

    return plaintext


#Modes: 0=Dec, 1=Oct, 2 = Hex, 3=Bin-forward-high, 4=Bin-forward-low, 5=Bin-backwards-high, 6=Bin-backwards-low
ciphertext = "733210497118101321001051159911111810111410110032973211611411710812132114101109971141079798108101321121141111111023211110232116104105115321161041011111141011093211910410599104321161041051153210997114103105110321051153211611111132115109971081083211611132991111101169710511046"
print(space_brute(ciphertext, 0))
