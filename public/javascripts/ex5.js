(() => {
    const APIN=`https://api.nasa.gov/planetary/apod`;
    const APINM=`Ca6au4SwFRWncfoRGKyVo6mlCn3X5gFV6MLZdsks`;
    let name;
    document.addEventListener("DOMContentLoaded", (e) => {
        document.getElementById('date-picker').valueAsDate = new Date();
        document.getElementById("LogIn").addEventListener("click", checkLogIn);
        document.getElementById("submit").addEventListener("click",selectDate);
    });
    /** This function opens the register button if the name is correct*/
    function checkLogIn() {
        if (checkName()) {
            document.getElementById("firstPage").style.display = "None";
            document.getElementById("secondPage").style.display = "block";
        }
    }
    /**This function checks if the username entered is correct
     *  @returns {boolean} true if the user entered a name, false otherwise*/
    function checkName() {
        name = document.getElementById("names").value;
        if (name.trim().length === 0 || name.trim().length > 25) {
            document.getElementById("error").innerHTML = "Invalid name (length/space)";
            return false;}
        if (/[^A-Za-z0-9]/.test(name)) {
            document.getElementById("error").innerHTML = "Invalid name (character)";
            return false;}
        document.getElementById("error").innerHTML = "";
        return true;
    }
    /**This function checks if the user selected a date and if the date is valid*/
    function selectDate()
    {
        let dateString = document.getElementById("date-picker").value;
        let  bDate=getDateMinus9Days(dateString,8)
        getData(dateString,bDate);
        openOptionMore(dateString,bDate)
    }
    /**This function subtracts 9 days from the date the user entered
     * @param dateString, @param bDate
     * @returns {Promise<void>}*/
    function getDateMinus9Days(date,minusDay) {
        let nDate = new Date(date);
        nDate.setDate(nDate.getDate() - minusDay);
        return(nDate.toISOString().split('T')[0])
    }
    /**This function allows the user to add more images to the page
     * @param dateString,bDate*/
    function openOptionMore(dateString,bDate)
    {
        document.getElementById("threePage").style.display = "block";
        addMore(dateString,bDate)
    }
    /** This function adds more images to the page
     * @param dateString,bDate*/
    function addMore(dateString,bDate)
    {
        document.getElementById("more").addEventListener("click", (event) => {
            let newDate= getDateMinus9Days(bDate,9);
            bDate=newDate;
            getData(dateString,newDate);
        });
    }
    /**The function brings the image of the same date entered by the user
     *  @param dateString, @param bDate
     *  @returns {Promise<void>}*/
    function getData(date,bDate)
    {
        let theurl =`${APIN}?api_key=${APINM}&start_date=${bDate}&end_date=${date}&concept_tags=True` // the form ACTION attribute - we can also ignore it and just hardcode the url
        fetch(`${theurl}`)
        .then(function(response) {
        return response.json();
        }).then(function(data) {
            let html=""
            data.reverse().forEach(e=> {
                console.log(e["date"])
                html+=pVPicture(e)
                getResponse(e)
            });
            document.getElementById("data").innerHTML = html;

            data.reverse().forEach(ele=> {
                document.getElementById(`${ele["date"]}sendRes`).addEventListener('click', addResponse)
            });
        })
            .catch(function(error) {
                    alert('Error: ' + error);});
    }

    /**This function prints the image video and text
     * @param data
     * @param html*/
    function pVPicture(e)
    {
        let html=""
            html+=`<div class ="col-4">`+`<ul>`;
            if(e["copyright"]!==undefined)
                html +=  `<li> ${e["copyright"]}</li>`
            html+= `<li> ${e["date"]}</li>` ;
            if (e.media_type === 'image')
                html += `<img class="img-fluid" src=${e.url} alt="" id="myImage">`//src של תמונה
            else
                html += `<iframe id="myFrame" width="560" height="315" src=${e.url} title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen></iframe>`//סרטונים
            html+= `<li> ${e["explanation"]}</li>` + `<li> ${e["title"]}</li>` + `</ul>`
            html += `<input type="text" placeholder="Enter your resp"  id="${e["date"]}addRes"  maxlength="128">`;
            html += `<button type="button" class="pressB" id = "${e["date"]}sendRes" >send</button><br><br>`;
            html += `<div ><ul id="${e["date"]}showRes"></ul></div></div>`;
            return html;
    }
    /**
     * This function adds the response to the page
     * @param element
     */
    function getResponse(element)
    {
        fetch(`/getResponses/${element["date"]}`)
            .then(function(response) {
                console.log("then1")
                return response.json();
            }).then(function(data) {
            console.log("then2")
            print(data,`${element["date"]}showRes`)
        }).catch(function(error) {
            alert('Error: ' + error);
        });
    }
    /**This function adds the response to the page
     * @param event*/
    function addResponse(event)
    {
        console.log("5")
        let date = event.target.id.split('sendRes')[0];
        let resp=document.getElementById(`${date}addRes`).value;
        let name=document.getElementById('names').value;
        fetch('/addResponse',{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"resp":resp,"date":date,"name":name})
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            print(data,`${date}showRes`)
        });
    }
    /**This function prints the response
     * @param data*/
    function print(data,date)
    {
        let str='<ul>'
        str+=printRBDel(data,str)
        str+='</ul>'
        document.getElementById(date).innerHTML =str;
        let delButtons=document.getElementsByClassName('delButton');
        for(let i=0;i<delButtons.length;i++)
        {
            delButtons[i].addEventListener('click',deleteResponse)
        }
    }
    /**This function prints the response and the delete button
     * @param data,resp,name,str
     * @returns {str}*/
    function printRBDel(data,str)
    {
        data.forEach(elem=>{
            str+=`<li><strong>${elem.name}:</strong>${elem.resp}</li>`
            if(elem.name===name)
                str+=`<button class="delButton" id="${elem.resCounter}" class="btn btn-danger">Delete</button>`
        });
        return str;
    }
    /**This function deletes the response
     * @param event*/
    function deleteResponse(event)
    {
        let id=event.target.id.split('del')[0];
        let date=event.target.parentElement.parentElement.parentElement.id;
        let data = { id: id,date: date,};
        fetch('/deleteResponse',{
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            print(data, `${date}`)
        });
    }
})()