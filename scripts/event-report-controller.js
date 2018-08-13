/**
 * Created by hisp on 2/12/15...........Durgamoni Tanti
 */
msfReportsApp.directive('calendar', function () {
    return {
        require: 'ngModel',
        link: function (scope, el, attr, ngModel) {
            $(el).datepicker({
                dateFormat: 'yy-mm-dd',
                onSelect: function (dateText) {
                    scope.$apply(function () {
                        ngModel.$setViewValue(dateText);
                    });
                }
            });
        }
    };
});
msfReportsApp
    .controller('TrackerReportController', function( $rootScope,
                                                     $scope,
                                                     $timeout,
                                                     MetadataService){

        jQuery(document).ready(function () {
            hideLoad();
        })
        $timeout(function(){
            $scope.date = {};
            $scope.date.startDate = new Date();
            $scope.date.endDate = new Date();
        },0);


        getAllPrograms();

        //initially load tree
        selection.load();
        // Listen for OU changes
        selection.setListenerFunction(function(){
            $scope.selectedOrgUnitUid = selection.getSelected();
            loadOU();
        },false);

        loadOU = function(){
            MetadataService.getOrgUnit($scope.selectedOrgUnitUid).then(function(orgUnit){
                $timeout(function(){
                    $scope.selectedOrgUnit = orgUnit;
                    //  $scope.selectedOrgUnitName = orgUnit.name;

                });
            });
        }
        function getAllPrograms (){
            MetadataService.getAllPrograms().then(function(prog) {
                $scope.allPrograms = prog.programs;
                $scope.programs = [];
                for(var i=0; i<prog.programs.length;i++){
                    if(prog.programs[i].withoutRegistration == false){

                        $scope.programs.push(prog.programs[i]);
                    }
                }
                $timeout(function(){

                })
            });
        }

        $scope.updateStartDate = function(startdate){
            $scope.startdateSelected = startdate;
            //  alert("$scope.startdateSelected---"+$scope.startdateSelected);
        };

        $scope.updateEndDate = function(enddate){
            $scope.enddateSelected = enddate;
            //  alert("$scope.enddateSelected---"+ $scope.enddateSelected);
        };

        $scope.fnExcelReport = function(){

          
            var blob = new Blob([document.getElementById('divId').innerHTML], {
                 type: 'text/plain;charset=utf-8',
                 endings: 'native' 
             });
                saveAs(blob, "AES/AMES-Report.xls");
             
        };

        $scope.generateReport = function(program){
            $scope.selectedOrgUnitName_level=$scope.selectedOrgUnit.level;
            $scope.selectedOrgUnitName = $scope.selectedOrgUnit.name;
            $scope.selectedStartDate = $scope.startdateSelected;
            $scope.selectedEndDate = $scope.enddateSelected;
            $scope.program = program;
            
            var str_new;
            for(var i=0; i<$scope.program.programTrackedEntityAttributes.length;i++){
                var str = $scope.program.programTrackedEntityAttributes[i].displayName;
                if($scope.program.id=='a9cQSlDVI2n')
                str_new=str.split("AES Enhanced Surveillance");
               
                if($scope.program.id=='eV13Hfo7qiv')
                str_new=str.split("AMES Surveillance");

                var n = str_new[1].lastIndexOf('-');
                $scope.program.programTrackedEntityAttributes[i].displayName = str_new[1].substring(n + 1);

            }
            $scope.psDEs = [];
            $scope.Options =[];
            $scope.attribute = "Attributes";
            $scope.org = "Organisation Unit : ";
            $scope.enrollment =["Enrollment date" , "Enrolling orgUnit"];
            $scope.start = "Start Date : ";
            $scope.end = "End Date : ";
            var options = [];

            var index=0;
            for (var i=0;i<$scope.program.programStages.length;i++){

                var psuid = $scope.program.programStages[i].id;
                $scope.psDEs.push({dataElement : {id : "orgUnit",name : "orgUnit",ps:psuid}});
                $scope.psDEs.push({dataElement : {id : "eventDate",name : "eventDate",ps:psuid}});

                for (var j=0;j<$scope.program.programStages[i].programStageDataElements.length;j++){

                    $scope.program.programStages[i].programStageDataElements[j].dataElement.ps = psuid;
                    var de =$scope.program.programStages[i].programStageDataElements[j];
                    $scope.psDEs.push(de);

                    if ($scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet != undefined) {
                        if ($scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options != undefined) {

                            for (var k = 0; k < $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options.length; k++) {
                                index=index+1; // $scope.Options.push($scope.program.programStages[i].programStageDataElements[j]);
                                var code = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].code;
                                var name = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].displayName;

                                options.push({code:code,name:name});
                                $scope.Options[$scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].code + "_index"] = $scope.program.programStages[i].programStageDataElements[j].dataElement.optionSet.options[k].displayName;
                            }
                        }
                    }
                }


            }



            if($scope.selectedOrgUnitName_level==5)
            {
                $scope.selectedOrgUnitName_level_id=$scope.selectedOrgUnit.parent.parent.parent.id;
            }
            else if($scope.selectedOrgUnitName_level==4)
            {
                $scope.selectedOrgUnitName_level_id=$scope.selectedOrgUnit.parent.parent.id;
            }
            else{
                $scope.selectedOrgUnitName_level_id=$scope.selectedOrgUnit.id;
            }

             var param = "var=program:"+program.id + "&var=orgunit:"+$scope.selectedOrgUnitName_level_id+"&var=startdate:"+$scope.startdateSelected+"&var=enddate:"+$scope.enddateSelected;

            MetadataService.getSQLView(SQLViewsName2IdMap[SQLQUERY_TEI_DATA_VALUE_NAME], param).then(function (stageData) {
                $scope.stageData = stageData;

                MetadataService.getSQLView(SQLViewsName2IdMap[SQLQUERY_TEI_ATTR_NAME], param).then(function (attrData) {
                    $scope.attrData = attrData;

                    MetadataService.getEnrollmentsBetweenDateProgramAndOu($scope.selectedOrgUnit.id,$scope.program.id,$scope.startdateSelected,$scope.enddateSelected).then(function(allenrollments){
                        $scope.allenrollments = allenrollments;
                        arrangeDataX($scope.stageData, $scope.attrData, $scope.allenrollments);
                    })
                })
            })



        }

        function showLoad()
        {
            setTimeout(function(){


            },1000);

            }
        function hideLoad() {
}
        function arrangeDataX(stageData,attrData,allenrollments){
            
            var allteid=[]
            for(var t=0;t<allenrollments.enrollments.length;t++)
            {
                allteid.push(allenrollments.enrollments[t].trackedEntityInstance) 
            }

            var final_rows=[]
            for(var i=0;i<allteid.length;i++)
            {
                for(var j=0;j<stageData.height;j++)
                {
                    var gg=stageData.rows[j][0]
                    if(stageData.rows[j][0]==allteid[i])
                    {
                        final_rows.push(stageData.rows[j])
                    }
                }
            }
            
            stageData.rows=final_rows;
            stageData.height=final_rows.length

            var report = [{
                teiuid : ""
            }]

            var teiWiseAttrMap = [];
            $scope.attrMap = [];
            $scope.teiList = [];
            $scope.eventList = [];
            $scope.maxEventPerTei = [];

            $scope.teiEnrollOrgMap = [];
            $scope.teiEnrollMap =[];
            $scope.teiEnrollMaptest=[]
            
            var teiPsMap = [];
            var teiPsEventMap = [];
            var teiPsEventDeMap = [];
            var teiEventMap = [];


            // For attribute
            const index_tei = 0;
            const index_attruid = 2;
            const index_attrvalue = 3;
            // const index_attrname = 4;
            const index_ouname = 4;
            const index_enrollmentDate = 6;

            // For Data values
            const index_deuid = 5;
            const index_devalue = 7;
            const index_ps = 1;
            const index_ev = 3;
            const index_evDate = 4;
            const index_ou = 8;
            for (var i=0;i<attrData.height;i++){
                var teiuid = attrData.rows[i][index_tei];
                var enrollDate = attrData.rows[i][index_enrollmentDate]; // enrollment date
                enrollDate = enrollDate.substring(0, 10);
                $scope.teiEnrollMaptest[teiuid]=enrollDate;

            }
            for (var i=0;i<attrData.height;i++){
                var teiuid = attrData.rows[i][index_tei];
                var attruid = attrData.rows[i][index_attruid];
                var attrvalue = attrData.rows[i][index_attrvalue];
                var ouname = attrData.rows[0][index_ouname];
                var enrollDate = attrData.rows[i][index_enrollmentDate]; // enrollment date
                enrollDate = enrollDate.substring(0, 10);
                if (teiWiseAttrMap[teiuid] == undefined){
                    teiWiseAttrMap[teiuid] = [];
                }
                teiWiseAttrMap[teiuid].push(attrData.rows[i]);
                if(attrvalue=="true")
                {
                    attrvalue="Yes";
                }
                else if( attrvalue=="false")
                {
                    attrvalue="No";
                }
                var datevalue=getval(teiuid)
                
                $scope.attrMap[datevalue+"-"+teiuid+"-"+attruid] = attrvalue;

                $scope.teiEnrollMap[datevalue+"-"+teiuid+"-enrollDate"] = enrollDate;
                
                for (var k=0; k< allenrollments.enrollments.length;k++) {
                    if (allenrollments.enrollments[k].trackedEntityInstance == attrData.rows[i][0]) {
                        $scope.teiEnrollOrgMap[datevalue+"-"+teiuid + "-ouname"] = allenrollments.enrollments[k].orgUnitName;
                    }
                }
                for(m in $scope.Options){

                    if(attrvalue+'_index' == m){

                        $scope.attrMap[datevalue+"-"+teiuid+"-"+attruid] = $scope.Options[m];
                    }

                }

            }

            for (key in teiWiseAttrMap){
                var testval=getval(key)
                $scope.teiList.push({teiuid : key});
                }

            $timeout(function(){
                $scope.teiList = $scope.teiList;
            })
            $scope.teis = prepareListFromMap(teiWiseAttrMap);

            var teiPerPsEventListMap = [];
            var teiToEventListMap = [];
            var eventToMiscMap = [];
            eventToMiscMap["dummy"] = {ou : "" , evDate : ""};
            var teiList = [];
            for (var i=0;i<stageData.height;i++) {
                var teiuid = stageData.rows[i][index_tei];
                var psuid = stageData.rows[i][index_ps];
                var evuid = stageData.rows[i][index_ev];
                var evDate = stageData.rows[i][index_evDate];
                evDate = evDate.substring(0, 10);
                var deuid = stageData.rows[i][index_deuid];
                var devalue = stageData.rows[i][index_devalue];
                var ou = stageData.rows[i][index_ou];

                if (!teiList[teiuid]){
                    teiList[teiuid] = true;
                }
                if (!teiPerPsEventListMap[teiuid]) {
                    teiPerPsEventListMap[teiuid] = [];
                    teiPerPsEventListMap[teiuid].max = 0;
                }

                if (!teiPerPsEventListMap[teiuid][psuid]) {
                    teiPerPsEventListMap[teiuid][psuid] = [];

                }

                if (!teiToEventListMap[evuid]) {
                    teiToEventListMap[evuid] = true;
                    teiPerPsEventListMap[teiuid][psuid].push(evuid);
                    if (teiPerPsEventListMap[teiuid][psuid].length > teiPerPsEventListMap[teiuid].max) {
                        teiPerPsEventListMap[teiuid].max = teiPerPsEventListMap[teiuid][psuid].length;
                    }
                }

                if (!teiPsEventMap[teiuid + "-" + psuid + "-" + evuid]){
                    teiPsEventMap[teiuid + "-" + psuid + "-" + evuid] = [];
                }

                eventToMiscMap[evuid] = {ou : ou , evDate : evDate};
                teiPsEventDeMap[teiuid + "-" + evuid + "-" + deuid] = devalue;
            }
            $scope.TheRows = [];
            var psDes = $scope.psDEs;

          
            for (key in teiList){
                var teiuid = key;
                var datevalue=getval(teiuid)
                
                $scope.eventList[datevalue+"-"+teiuid] = [];
                
           
                
                
                var maxEventCount = teiPerPsEventListMap[teiuid].max;

                if (maxEventCount == 0){debugger}
                for (var y=0;y<maxEventCount;y++){

                    $scope.TheRows = [];
                    for (var x=0;x<psDes.length;x++){
                        var psuid = psDes[x].dataElement.ps;
                        var deuid = psDes[x].dataElement.id;
                        var evuid = undefined;
                        if (teiPerPsEventListMap[teiuid][psuid]){
                            evuid = teiPerPsEventListMap[teiuid][psuid][y];
                        }
                        if (!evuid){
                            evuid =  "dummy";
                        }
                        var val = teiPsEventDeMap[teiuid + "-" + evuid + "-" + deuid];
                        if (deuid == "orgUnit") {
                            val = eventToMiscMap[evuid].ou;//debugger
                        } else if (deuid == "eventDate") {
                            val = eventToMiscMap[evuid].evDate;//debugger
                        }
                        if($scope.psDEs[x].dataElement.optionSet != undefined){
                            if($scope.psDEs[x].dataElement.optionSet.options != undefined){

                                val = $scope.Options[val+'_index'];


                                if (!val)
                                val="";

                                
                            }
                              
                           
                        }
                        $scope.TheRows.push(val?val:"");
                            
                    }


                    for(var i=0;i<$scope.TheRows.length;i++)
                    {
                        
                            if($scope.TheRows[i]=="true")
                            {
                                $scope.TheRows[i]="Yes";
                            }
                            if($scope.TheRows[i]=="false")
                            {
                                $scope.TheRows[i]="No";
                            } 

                            
                        }
                        var datevalue=getval(teiuid)
                
                        $scope.eventList[datevalue+"-"+teiuid].push($scope.TheRows);
                }
            }

            $scope.teiPerPsEventListMap = teiPerPsEventListMap;
            $scope.teiListvalue = Object.keys(teiList);
            $scope.teiList=[]
            for(var i=0;i<$scope.teiListvalue.length;i++)
            {
                var dateval=getval($scope.teiListvalue[i])
                $scope.teiList.push(dateval+"-"+$scope.teiListvalue[i])
            }
            $scope.teiList=$scope.teiList.sort()
            hideLoad();
        }

        getval=function(key){

            date=$scope.teiEnrollMaptest[key]
            
                return date
           
        }


    });
