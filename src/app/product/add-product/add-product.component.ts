import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { MatSnackBar } from '@angular/material';

import { ProductService } from '../product.service';
import { Product } from './product.model';
import { MOQ } from '../../moq/create-moq/moq.model';
import { SuperCategory } from '../../category/super-category/superCategory.model';
import { priceValue } from '../../shared/validation/price-validation';

import { Size } from './size.model';
import { MatTabChangeEvent, MatTab } from '@angular/material';
import { ProductSettings } from 'src/app/settings/product-settings/product-settings.model';


export interface PeriodicElement {
  /*  primeImage: string; */
  moqName: string;
  moqDescription: string;
  moqQuantity: string;
}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})

export class AddProductComponent implements OnInit {
  @ViewChild('myDiv') myDivElementRef: ElementRef;
  selectedIndex = 0;
  matTab: MatTab;
  productForm: FormGroup;
  productModel: Product;
  productDetail: Product[];
  sizeDetailData: ProductSettings[];
  moqModel: MOQ;
  mainCategoryModel = new Array();
  subCategoryModel = new Array();
  superCategoryModel: SuperCategory[];
  filteredSuperCategory = new Array();
  filteredMainCategory = new Array();
  message;
  action;
  productId;
  moqId;
  searchText;
  showSkuError: boolean;
  skuFilter;
  categories;
  superCategoryName;
  mainCategoryName;
  showMainCategory: boolean;
  showMainCategoryError: boolean;
  showCategory: boolean;
  showSelectedMOQ: boolean;
  category;
  mainCategory;
  mainCategoryData: string;
  moqName;
  imageError: boolean;

  fileLength;
  selectRegion: number;
  fileToUpload;
  urls = new Array<string>();
  localArray: any = [];
  selected: string;
  regionSelectedSize;
  arryValue: any = [];
  confirmRegion: any = [];
  countryFilter = [];
  countryError;
  priceError: boolean;
  selecteValue: any = [];
  reader: FileReader = new FileReader();
  displayedColumns: string[] = ['moqName', 'moqDescription', 'moqQuantity'];
  moqData;
  material;
  color;
  sizeDetail;
  occasion;
  subCategoryError: boolean;
  showSubCategory: boolean;
  subCategoryName: any;
  subCategory;
  productSettingsModel: ProductSettings;
  constructor(private fb: FormBuilder, private router: Router, private productService: ProductService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getRegions();
    this.createForm();
    this.showSuperCategory();
    this.showMOQ();
    this.getProducts();
    this.getProductSettings();
    /* this.addProducts(); */
  }
  createForm() {
    this.productForm = this.fb.group({
      id: [''],
      productName: [''],
      productDescription: [''],
      price: ['', priceValue],
      mrp: ['', priceValue],
      sp: ['', priceValue],
      size: [''],
      color: [''],
      height: [''],
      weight: [''],
      styleCode: [''],
      skuCode: [''],
      skuCodeValue: [''],
      region: [''],
    bulletPoints: [''],
      material: [''],
     occassion: [''],
      mfdQty: ['', priceValue],
      confirmRegion: this.fb.array([
      ])
    });
  }
  getProductSettings() {
       this.productService.getProductSettings().subscribe(data => {
         console.log('settings', data);
         this.productSettingsModel = data;
         this.material = data[0].material;
         this.color = data[0].color;
         this.sizeDetail = data[0].size;
         this.occasion = data[0].occasion;

       }, err => {
         console.log(err);
       });
  }
  selectedIndexChange(val: number) {
    this.selectedIndex = val;
  }
  selectNextTab(tab) {
    if (tab !== 4) {
      this.selectedIndex = tab + 1;
    } else {
      this.selectedIndex = 4;
    }
  }
  selectPreviousTab(tab) {
    if (tab !== 0) {
      this.selectedIndex = tab - 1;
    } else {
      this.selectedIndex = 0;
    }
  }
  get regionForms() {
    return this.productForm.get('confirmRegion') as FormArray;
  }
  selectAllRegion() {
    for (let i = 0; i <= this.sizeDetailData.length - 1; i++) {
      const data = this.fb.group({
        sizeName: [this.sizeDetailData[i]],
        skuCode: [''],
      });
      this.regionForms.push(data);
    }
    console.log(this.regionForms);
  }
  selectedCountry(test, inputRegionName) {
    this.countryFilter =
      this.confirmRegion.filter(data => data.size.indexOf(inputRegionName) !== -1);
    if (this.countryFilter.length !== 0) {
      this.countryError = true;
    } else {
      this.countryError = false;
      this.confirmRegion.push(test);
    }
    console.log('form data', this.confirmRegion);
  }
  selectedSuperCategory(val) {
    this.category = val._id;
    this.superCategoryName = val.categoryName;
    this.filteredSuperCategory = this.superCategoryModel.filter(data => data._id === val._id);
    this.mainCategoryModel = this.filteredSuperCategory[0].mainCategory;
    if (this.mainCategoryModel.length !== 0) {
      this.showMainCategory = true;
      this.showMainCategoryError = false;
      this.showCategory = false;
    } else {
      this.showMainCategory = false;
      this.showMainCategoryError = true;
      this.showCategory = false;
    }
  }
  selectedSubCategory(subCategoryVal) {
    this.subCategory = subCategoryVal.subCategoryName;
    this.categories = subCategoryVal._id;
    this.showCategory = true;
    this.subCategoryError = false;
    this.subCategoryName = subCategoryVal.subCategoryName;
      }
  deleteCountry(data) {
    this.countryError = false;
    const index = this.confirmRegion.indexOf(data);
    if (index > -1) {
      this.confirmRegion.splice(index, 1);
    }
  }

  addNewRegion(e, sizeData) {
    this.countryError = false;
    this.countryFilter = this.confirmRegion.filter(data => data.indexOf(sizeData) !== -1);
    if (e.checked === true) {
      this.regionSelectedSize = sizeData;
      console.log('selected size', this.regionSelectedSize);
    } else {
      this.regionSelectedSize = '';
    }
  }

  handleFileInput(images: any) {
    this.imageError = false;
    this.fileToUpload = images;
    this.urls = [];
    const files = images;
    if (files) {
      for (const file of files) {
        this.reader = new FileReader();
        this.reader.onload = (e: any) => {
          this.urls.push(e.target.result);
        };
        this.reader.readAsDataURL(file);
      }
    }
  }
  showMOQ() {
    this.productService.showMoq().subscribe(data => {
      this.moqModel = data;
      this.moqData = new MatTableDataSource<PeriodicElement>(data);
    }, err => {
      console.log(err);
    });
  }
  getRegions() {
    this.productService.getProductSettings().subscribe(data => {
      this.sizeDetailData = data[0].size;
      this.selectAllRegion();
    }, err => {
      console.log(err);
    });
  }
  showSuperCategory() {
    this.productService.showAllSuperCategory().subscribe(data => {
      this.superCategoryModel = data;
    }, err => {
      console.log(err);
    });
  }
  getProducts() {
    this.productService.getProducts().subscribe(data => {
      this.productDetail = data;
    }, err => {
      console.log(err);
    });
  }

  selectedCategory(categoryVal) {
    this.mainCategory = categoryVal._id;
    this.mainCategoryData = categoryVal.mainCategoryName;
    this.categories = categoryVal._id;
    this.showCategory = true;
  }
  selectedMainCategory(categoryVal) {
    this.mainCategory = categoryVal.mainCategoryName;
    this.showCategory = false;
    this.filteredMainCategory = this.mainCategoryModel.filter(data => data._id === categoryVal._id);
    this.subCategoryModel = this.filteredMainCategory[0].subCategory;
    if (this.subCategoryModel.length !== 0) {
      this.showSubCategory = true;
      this.subCategoryError = false;
    } else {
      this.showSubCategory = false;
      this.subCategoryError = true;
    }
  }
  deleteCategory(data) {
    const index = this.categories.indexOf(data);
    if (index > -1) {
      this.categories.splice(index, 1);
    }
  }
  skuCodeVerify(elem) {
    this.productDetail.forEach(element => {
      if (element.skuCode === elem) {
        element.skuCodeVerify = true;
      } else {
        element.skuCodeVerify = false;
      }
    });
  }
  selectedMOQ(event, data) {
    this.moqId = data._id;
    this.moqName = data.moqName;
    this.showSelectedMOQ = true;
  }
  validateProducts() {
    if (this.productForm.controls.productName.value === ''
      || this.fileToUpload === undefined || this.productForm.controls.styleCode.value === '') {
      this.selectedIndex = 0;
      if (this.fileToUpload === undefined) {
        this.imageError = true;
      } else {
        this.imageError = false;
      }
    } else {
      this.addProducts();
    }
  }
  addProducts() {
    this.message = 'Product added successfully';
    this.productModel = new Product();
    this.productModel.productName = this.productForm.controls.productName.value;
    this.productModel.productDescription = this.productForm.controls.productDescription.value;
    this.productModel.price = this.productForm.controls.price.value;
    this.productModel.color = this.productForm.controls.color.value;
    this.productModel.mfdQty = this.productForm.controls.mfdQty.value;
    this.productModel.styleCode = this.productForm.controls.styleCode.value.toUpperCase();
    this.productModel.skuCode = this.productForm.controls.skuCode.value.toUpperCase();
    this.productModel.bulletPoints = this.productForm.controls.bulletPoints.value;
    this.productModel.height = this.productForm.controls.height.value;
    this.productModel.weight = this.productForm.controls.weight.value;
    this.productModel.occassion = this.productForm.controls.occassion.value;
    this.productModel.moq = this.moqId;
    // category
    this.productModel.subCategory = this.categories;
    // detials
    this.productModel.material = this.productForm.controls.material.value;
    this.productModel.size = this.confirmRegion;
    this.productService.addProduct(this.productModel).subscribe(data => {
      this.productId = data._id;
      this.uploadImages(this.productModel.styleCode);
      this.snackBar.open(this.message, this.action, {
        duration: 3000,
      });
    }, error => {
      console.log(error);
    });
  }
  subProduct(path, productModel) {
    this.productService.addRegionService(path,
      productModel).subscribe(data => {
        console.log(data);
        this.snackBar.open(this.message, this.action, {
          duration: 3000,
        });
      });
  }

  uploadImages(skucode) {
    const formData: any = new FormData();
    this.fileLength = this.fileToUpload.length;
    for (let i = 0; i <= this.fileLength; i++) {
      formData.append('uploads[]', this.fileToUpload[i]);
    }
    this.productService.uploadImages(formData, skucode).subscribe(data => {
    }, error => {
      console.log(error);
    });
  }
  redirect() {
    this.router.navigate(['product/viewproducts']);
  }
}
