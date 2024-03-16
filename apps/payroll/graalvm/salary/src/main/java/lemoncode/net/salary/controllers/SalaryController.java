package lemoncode.net.salary.controllers;

import lemoncode.net.salary.models.Salary;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/salary")
public class SalaryController {

    @GetMapping()
    public ResponseEntity<Salary> getSalary() {
        int salary = (int)(Math.random() * 1000 + 1500);
        Salary response = new Salary(salary);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}