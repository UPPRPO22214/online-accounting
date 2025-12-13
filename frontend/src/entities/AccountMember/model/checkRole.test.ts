import { describe, expect, test } from 'vitest';
import { checkRole } from './checkRole';

describe('Check role tests', () => {
  test('No user role', () => {
    expect(checkRole()).toBeFalsy();
    expect(checkRole(undefined, 'viewer')).toBeFalsy();
    expect(checkRole(undefined, 'contributor')).toBeFalsy();
    expect(checkRole(undefined, 'admin')).toBeFalsy();
    expect(checkRole(undefined, 'owner')).toBeFalsy();
  });

  test('No required role', () => {
    expect(checkRole('viewer')).toBeTruthy();
    expect(checkRole('contributor')).toBeTruthy();
    expect(checkRole('admin')).toBeTruthy();
    expect(checkRole('owner')).toBeTruthy();
  });

  test('Check viewer role', () => {
    expect(checkRole('viewer', 'viewer')).toBeTruthy();
    expect(checkRole('contributor', 'viewer')).toBeTruthy();
    expect(checkRole('admin', 'viewer')).toBeTruthy();
    expect(checkRole('owner', 'viewer')).toBeTruthy();
  });

  test('Check contributor role', () => {
    expect(checkRole('viewer', 'contributor')).toBeFalsy();
    expect(checkRole('contributor', 'contributor')).toBeTruthy();
    expect(checkRole('admin', 'contributor')).toBeTruthy();
    expect(checkRole('owner', 'contributor')).toBeTruthy();
  });

  test('Check admin role', () => {
    expect(checkRole('viewer', 'admin')).toBeFalsy();
    expect(checkRole('contributor', 'admin')).toBeFalsy();
    expect(checkRole('admin', 'admin')).toBeTruthy();
    expect(checkRole('owner', 'admin')).toBeTruthy();
  });

  test('Check owner role', () => {
    expect(checkRole('viewer', 'owner')).toBeFalsy();
    expect(checkRole('contributor', 'owner')).toBeFalsy();
    expect(checkRole('admin', 'owner')).toBeFalsy();
    expect(checkRole('owner', 'owner')).toBeTruthy();
  });
});
