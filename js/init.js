function application(){
    this.data_source = {
      id:'',
      name:'',
      employees:'',
      children : []
    };
    this.persons_data = {};
    this.server_url = '';
};

application.prototype.addToArray = function(deptId, data_source, elem){
    var currapp = this;
    var c = 0;
    if (data_source.id == deptId){
        if (elem.ID in currapp.persons_data){
            var list = currapp.persons_data[elem.ID];
        }else{
            var list = '';
        }  
        var html = `<ul id="${elem.ID}">${list}</ul>`;
        var data_item = {
          id:elem.ID.toString(),
          name:elem.NAME,
          employees: html,
          children : []
        };
        data_source.children.push(data_item);
    }else{
        if(data_source.children.length > 0){
            data_source.children.forEach(function(children_data){
                currapp.addToArray(deptId, children_data, elem);
           });
        }
    }
};

application.prototype.collectPersons = function(){
    var currapp = this;    
    BX24.callMethod('user.get', {}, function(result){
        if (result.error())
        {
               alert('Request error: ' + result.error());
        }
         else
        {
            var persons = result.data();
            persons.forEach(function(elem){
                if (elem.ACTIVE){
                    var no_photo = 'img/no_photo.gif';
                    var person_url = currapp.server_url + '/company/personal/user/' + elem.ID + '/';
                    if (elem.PERSONAL_PHOTO != null){
                        var photo = elem.PERSONAL_PHOTO;
                    }else{
                        var photo = no_photo;
                    }
                    var html =  `
                        <li>
                            <div class="min-content">
                                <div class="photo-container">
                                    <img src="${photo}" width="50">
                                </div>
                                <div class="info">
                                    <p class="name">
                                        <a href="${person_url}">${elem.NAME}  ${elem.LAST_NAME }</a>
                                    </p>
                                    <p class="position">${elem.WORK_POSITION}</p>
                                </div>
                            </div>
                            <div class="tooltip">
                                <div class="photo-container">
                                    <img src="${photo}">
                                </div>
                                <div class="info">
                                    <p class="name">
                                        <a href="${person_url}">${elem.NAME} ${elem.LAST_NAME }</a>
                                    </p>
                                    <p class="position">Должность:${elem.WORK_POSITION}</p>
                                    <p class="inner_phone">Внутренний телефон:${elem.UF_PHONE_INNER}</p>
                                    <p class="email">
                                        Email:<a href="mailto:${elem.EMAIL}">${elem.EMAIL}</a> 
                                    </p>
                                </div>          
                            </div>
                        </li>
                    `;
                    elem.UF_DEPARTMENT.forEach(function(dept){
                        if ( (dept in currapp.persons_data) == false){
                            currapp.persons_data[dept] = html
                        }else{
                            currapp.persons_data[dept] += html;
                        }
                    });
                }
            });

            if (result.more()){
                result.next();
            }else{
                currapp.collectDataItems();
            }
        }
    });
};

application.prototype.collectDataItems = function(){
    var currapp = this;    
    BX24.callMethod('department.get', {}, function(result){
        if (result.error())
        {
               alert('Request error: ' + result.error());
        }
         else
        {
            var depts = result.data();
            depts.forEach(function(elem){
                if (elem.ID in currapp.persons_data){
                    var list = currapp.persons_data[elem.ID];
                }else{
                    var list = '';
                }  
                var html = `<ul id="${elem.ID}">${list}</ul>`;
              if( ("PARENT" in elem) == false){
                currapp.data_source.id = elem.ID.toString();
                currapp.data_source.name = elem.NAME;
                currapp.data_source.employees = html;
              }else{
                currapp.addToArray(elem.PARENT, currapp.data_source, elem);
              }     
           
            });
            
            if (result.more()){
                result.next();
            }else{
                BX24.resizeWindow(1550, 800);
                $('#chart-container').orgchart({
                  'data' : currapp.data_source,
                  'nodeContent': 'employees',
                  'exportButton':true,
                  'exportFilename':'chart',
                  'exportFileextension':'png',
                  'pan':true,
                  'zoom':true,
                });
            }
        }
    });
};

var app = new application();
